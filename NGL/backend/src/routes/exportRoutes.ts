import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { INode, IConnection } from '../models/Graph';

const router = Router();

// Helper to format a node and its connections as a code block string
function generateNodeCodeObject(node: INode, allNodes: INode[], connections: IConnection[]) {
  const outgoingConnections = connections.filter((c) => c.fromNodeId === node.id);
  const connectedTargets = outgoingConnections.map((c) => {
    const target = allNodes.find((n) => n.id === c.toNodeId);
    return target ? `${target.title} (${c.toPort})` : c.toNodeId;
  });

  const codeObj: Record<string, any> = {
    title: node.title,
    color: node.color || '#6366f1',
  };

  if (node.imageUrl) {
    codeObj.attachmentImage = node.imageUrl;
  }

  if (node.labels && node.labels.length > 0) {
    codeObj.labels = node.labels.map((lbl) => ({
      title: lbl.text,
      ...(lbl.detail ? { detail: lbl.detail } : {}),
    }));
  }

  if (connectedTargets.length > 0) {
    codeObj.connectedTo = connectedTargets;
  }

  return codeObj;
}

// Server-side Export Route
router.post('/', (req: Request, res: Response): void => {
  try {
    const { title, nodes, connections, format } = req.body;

    const graphTitle = title || 'Node Graph';
    const sanitizeFilename = graphTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const exportFormat = (format || 'md').toLowerCase();
    const nodeList: INode[] = nodes || [];
    const connList: IConnection[] = connections || [];

    // Format all nodes into code objects
    const nodeCodeObjects = nodeList.map((node) => ({
      rawNode: node,
      codeObj: generateNodeCodeObject(node, nodeList, connList),
      codeString: JSON.stringify(generateNodeCodeObject(node, nodeList, connList), null, 2),
    }));

    // 1. MARKDOWN EXPORT (.md)
    if (exportFormat === 'md') {
      let mdContent = `# Node Graph Architecture: ${graphTitle}\n\n`;
      mdContent += `> Generated on ${new Date().toLocaleString()} • ${nodeList.length} Nodes • ${connList.length} Connections\n\n`;
      mdContent += `---\n\n`;

      nodeCodeObjects.forEach(({ rawNode, codeString }, idx) => {
        mdContent += `### Node ${idx + 1}: ${rawNode.title}\n\n`;
        mdContent += `\`\`\`json\n${codeString}\n\`\`\`\n\n`;
      });

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename}.md"`);
      res.send(mdContent);
      return;
    }

    // 2. PLAIN TEXT EXPORT (.txt)
    if (exportFormat === 'txt') {
      let txtContent = `====================================================\n`;
      txtContent += `NODE GRAPH ARCHITECTURE: ${graphTitle.toUpperCase()}\n`;
      txtContent += `Date: ${new Date().toLocaleString()}\n`;
      txtContent += `Nodes: ${nodeList.length} | Connections: ${connList.length}\n`;
      txtContent += `====================================================\n\n`;

      nodeCodeObjects.forEach(({ rawNode, codeString }, idx) => {
        txtContent += `--- [Node #${idx + 1}] ${rawNode.title} ---\n`;
        txtContent += `${codeString}\n\n`;
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename}.txt"`);
      res.send(txtContent);
      return;
    }

    // 3. JSON EXPORT (.json)
    if (exportFormat === 'json') {
      const jsonExportData = {
        title: graphTitle,
        exportedAt: new Date().toISOString(),
        nodeCount: nodeList.length,
        connectionCount: connList.length,
        nodes: nodeCodeObjects.map((n) => n.codeObj),
        connections: connList,
      };

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename}.json"`);
      res.send(JSON.stringify(jsonExportData, null, 2));
      return;
    }

    // 4. PDF EXPORT (.pdf) VIA PDFKIT
    if (exportFormat === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename}.pdf"`);

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);

      // Header Banner
      doc
        .rect(0, 0, doc.page.width, 70)
        .fill('#090d16');

      doc
        .fillColor('#6366f1')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('NodeGraph.io', 40, 20);

      doc
        .fillColor('#ffffff')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(graphTitle, 180, 24);

      doc
        .fillColor('#94a3b8')
        .fontSize(9)
        .font('Helvetica')
        .text(`Exported on ${new Date().toLocaleString()} | ${nodeList.length} Nodes | ${connList.length} Connections`, 40, 50);

      doc.moveDown(3);

      // Render Each Node as a Monospace Code Block Box
      nodeCodeObjects.forEach(({ rawNode, codeString }, idx) => {
        if (doc.y > 680) {
          doc.addPage();
        }

        const boxY = doc.y;
        const boxWidth = doc.page.width - 80;

        // Header tag
        doc
          .fillColor('#6366f1')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`Node #${idx + 1}: ${rawNode.title}`, 40, boxY);

        doc.moveDown(0.4);

        // Code block container box
        const lines = codeString.split('\n');
        const boxHeight = lines.length * 12 + 16;

        doc
          .roundedRect(40, doc.y, boxWidth, boxHeight, 8)
          .fillAndStroke('#1e293b', '#334155');

        doc
          .fillColor('#38bdf8')
          .fontSize(9)
          .font('Courier');

        let textY = doc.y - boxHeight + 10;
        lines.forEach((line) => {
          doc.text(line, 52, textY);
          textY += 12;
        });

        doc.y = textY + 15;
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Unsupported export format. Choose md, txt, json, or pdf.' });
  } catch (error: any) {
    console.error('❌ Server-side Export Error:', error);
    res.status(500).json({ message: error.message || 'Failed to export graph' });
  }
});

export default router;

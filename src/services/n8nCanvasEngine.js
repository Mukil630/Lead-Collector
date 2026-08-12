/**
 * ⚡ n8n Workflow Graph Engine
 * Manages draggable nodes, SVG cubic bezier wire connections, 
 * data pulse animations, and interactive node inspectors.
 */

export class N8nCanvasEngine {
  constructor(canvasContainerId, svgId) {
    this.container = document.getElementById(canvasContainerId);
    this.svg = document.getElementById(svgId);
    this.nodes = [];
    this.connections = [];
    this.isDragging = false;
    this.draggedNodeId = null;
    this.dragOffset = { x: 0, y: 0 };
    this.onNodeClick = null;
  }

  init(nodesData, connectionsData) {
    this.nodes = nodesData;
    this.connections = connectionsData;
    this.renderNodes();
    this.renderConnections();
    this.setupEvents();
  }

  renderNodes() {
    if (!this.container) return;
    
    // Clear existing node cards
    const existingCards = this.container.querySelectorAll('.n8n-framework-node');
    existingCards.forEach(c => c.remove());

    this.nodes.forEach(node => {
      const card = document.createElement('div');
      card.className = `n8n-framework-node ${node.statusClass || ''}`;
      card.id = `node-${node.id}`;
      card.style.left = `${node.x}px`;
      card.style.top = `${node.y}px`;

      card.innerHTML = `
        <div class="node-pins-container left">
          ${node.inputs ? node.inputs.map(inp => `<div class="n8n-pin pin-input" data-pin-id="${inp.id}" title="${inp.label}"></div>`).join('') : ''}
        </div>
        
        <div class="node-header">
          <div class="node-title-group">
            <span class="node-icon">${node.icon}</span>
            <span class="node-title">${node.title}</span>
          </div>
          <span class="node-badge ${node.badgeClass}">${node.badge}</span>
        </div>

        <div class="node-content">
          <p class="node-desc">${node.desc}</p>
          <div class="node-meta-row">
            <span class="node-file-tag">${node.fileBasename}</span>
            <span class="node-lead-count">${node.leadCount !== undefined ? node.leadCount + ' items' : 'READY'}</span>
          </div>
        </div>

        <div class="node-pins-container right">
          ${node.outputs ? node.outputs.map(out => `<div class="n8n-pin pin-output" data-pin-id="${out.id}" title="${out.label}"></div>`).join('') : ''}
        </div>
      `;

      // Drag listener
      card.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('n8n-pin')) return;
        this.isDragging = true;
        this.draggedNodeId = node.id;
        const rect = card.getBoundingClientRect();
        this.dragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        card.classList.add('dragging');
      });

      // Click listener
      card.addEventListener('click', (e) => {
        if (this.onNodeClick) this.onNodeClick(node);
      });

      this.container.appendChild(card);
    });
  }

  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.draggedNodeId) return;
      const containerRect = this.container.getBoundingClientRect();
      const nodeObj = this.nodes.find(n => n.id === this.draggedNodeId);
      if (!nodeObj) return;

      const newX = e.clientX - containerRect.left - this.dragOffset.x + this.container.scrollLeft;
      const newY = e.clientY - containerRect.top - this.dragOffset.y + this.container.scrollTop;

      nodeObj.x = Math.max(20, newX);
      nodeObj.y = Math.max(20, newY);

      const el = document.getElementById(`node-${this.draggedNodeId}`);
      if (el) {
        el.style.left = `${nodeObj.x}px`;
        el.style.top = `${nodeObj.y}px`;
      }

      this.renderConnections();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging && this.draggedNodeId) {
        const el = document.getElementById(`node-${this.draggedNodeId}`);
        if (el) el.classList.remove('dragging');
      }
      this.isDragging = false;
      this.draggedNodeId = null;
    });

    window.addEventListener('resize', () => {
      this.renderConnections();
    });
  }

  renderConnections() {
    if (!this.svg || !this.container) return;

    this.svg.innerHTML = '';
    const containerRect = this.container.getBoundingClientRect();

    this.connections.forEach(conn => {
      const fromNodeEl = document.getElementById(`node-${conn.fromNode}`);
      const toNodeEl = document.getElementById(`node-${conn.toNode}`);

      if (!fromNodeEl || !toNodeEl) return;

      const fromPin = fromNodeEl.querySelector(`.pin-output[data-pin-id="${conn.fromPin}"]`) || fromNodeEl.querySelector('.pin-output');
      const toPin = toNodeEl.querySelector(`.pin-input[data-pin-id="${conn.toPin}"]`) || toNodeEl.querySelector('.pin-input');

      if (!fromPin || !toPin) return;

      const fromRect = fromPin.getBoundingClientRect();
      const toRect = toPin.getBoundingClientRect();

      const startX = fromRect.left + fromRect.width / 2 - containerRect.left + this.container.scrollLeft;
      const startY = fromRect.top + fromRect.height / 2 - containerRect.top + this.container.scrollTop;
      const endX = toRect.left + toRect.width / 2 - containerRect.left + this.container.scrollLeft;
      const endY = toRect.top + toRect.height / 2 - containerRect.top + this.container.scrollTop;

      const dx = Math.abs(endX - startX) * 0.5;
      const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', `n8n-wire ${conn.active ? 'wire-active' : ''} ${conn.type || ''}`);

      this.svg.appendChild(path);

      if (conn.active) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#38bdf8');
        
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('path', pathD);
        animateMotion.setAttribute('dur', '1.8s');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        
        circle.appendChild(animateMotion);
        this.svg.appendChild(circle);
      }
    });
  }

  updateNodeStatus(nodeId, statusClass, leadCount = null) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.statusClass = statusClass;
      if (leadCount !== null) node.leadCount = leadCount;
      
      const el = document.getElementById(`node-${nodeId}`);
      if (el) {
        el.className = `n8n-framework-node ${statusClass}`;
        const countEl = el.querySelector('.node-lead-count');
        if (countEl && leadCount !== null) countEl.textContent = `${leadCount} items`;
      }
    }
  }
}

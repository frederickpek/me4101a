let VERTEX_RADIUS = 14;
let SVG_URI = "http://www.w3.org/2000/svg";

let vertices = [];
let edges = [];
let vertexIdSpeficier = 0;
let edgeIdSpeficier = 1;
let svg = document.getElementById("viewbox");
let bidirectedEdgeCheckbox = document.querySelector('.bidirected-edge');

/* edge creation variables */
let currEdge = null;

/* dragging variables */
let currVertex = null;

let isBidirectedEdge = () => {
  return bidirectedEdgeCheckbox.checked;
};

let getSvgLoc = (e) => {
  let pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

let getSvgVertices = () => {
  return document.querySelector('.vertices');
};

let getSvgEdges = () => {
  return document.querySelector('.edges');
};

let removeVertexFromVertices = (v) => {
  vertices = vertices.filter(u => u.id != v.id);
};

let removeVertexFromSvgVertices = (v) => {
  let svgVertices = getSvgVertices();
  for (let child of svgVertices.children) {
    if (child.getAttributeNS(null, 'id') == v.id) {
      svgVertices.removeChild(child);
    }
  }
};

let getEdgesLinkedTo = (v) => {
  edgeList = [];
  for (let e of edges) {
    if (e.v1 == v.id || e.v2 == v.id) {
      edgeList.push(e);
    }
  }
  return edgeList;
};

let removeEdgeFromEdges = (e) => {
  edges = edges.filter(o => o.id != e.id);
};

let removeEdgeFromSvgEdges = (e) => {
  let svgEdges = getSvgEdges();
  for (let child of svgEdges.children) {
    if (child.getAttributeNS(null, 'id') == e.id) {
      svgEdges.removeChild(child);
    }
  }
};

let deleteVertexListener = (v) => {
  return (e) => {
    e.preventDefault();

    save();
    resetTraversal();
    removeVertexFromVertices(v);
    removeVertexFromSvgVertices(v);

    edgeList = getEdgesLinkedTo(v);
    for (let edge of edgeList) {
      removeEdgeFromEdges(edge);
      removeEdgeFromSvgEdges(edge);
    }
  };
};

let startDrag = (e) => {
  if (e.which != 2) return;
  /* hacky but whatever */
  save();
  let loc = getSvgLoc(e);
  currVertex = isOverVertex(loc.x, loc.y);
};

let updateVertexLoc = (v, x, y) => {
  v.x = x;
  v.y = y;
  let svgVertices = getSvgVertices();
  for (let vertex of svgVertices.children) {
    if (vertex.getAttributeNS(null, 'id') == v.id) {
      let body = getVertexBody(vertex);
      body.setAttributeNS(null, 'cx', v.x);
      body.setAttributeNS(null, 'cy', v.y);

      let label = getVertexLabel(vertex);
      label.setAttributeNS(null, 'x', v.x);
      label.setAttributeNS(null, 'y', v.y);

      edgeList = edges.filter(e => e.v1 == v.id);
      for (let edge of edgeList) {
        edge.x1 = x;
        edge.y1 = y;
        updateEdgeSvg(edge);
      }

      edgeList = edges.filter(e => e.v2 == v.id);
      for (let edge of edgeList) {
        edge.x2 = x;
        edge.y2 = y;
        updateEdgeSvg(edge);
      }

    }
  }
};

let drag = (e) => {
  e.preventDefault();
  if (e.which != 2) return;
  if (!currVertex) return;
  let loc = getSvgLoc(e);
  updateVertexLoc(currVertex, loc.x, loc.y);
};

let endDrag = (e) => {
  if (e.which != 2) return;
  currVertex = null;
};

let contDrag = (e) => {
  if (e.which != 2) return;
  drag(e);
};

let addVertexEventListeners = (v) => {
  v.addEventListener('contextmenu', deleteVertexListener(v));
  v.addEventListener('mousedown', startDrag);
  v.addEventListener('mousemove', drag);
  v.addEventListener('mouseleave', contDrag);
  v.addEventListener('mouseup', endDrag);
};

let addVertexToSvg = (v) => {
  let group = document.createElementNS(SVG_URI, 'g');
  group.setAttributeNS(null, 'class', "vertex");
  group.setAttributeNS(null, 'id', v.id);
  
  let body = document.createElementNS(SVG_URI, 'circle');
  body.setAttributeNS(null, 'class', "body");
  body.setAttributeNS(null, 'cx', v.x);
  body.setAttributeNS(null, 'cy', v.y);
  body.setAttributeNS(null, 'r', VERTEX_RADIUS);
  body.setAttributeNS(null, 'fill', WHITE);
  body.setAttributeNS(null, 'stroke-width', STROKE_WIDTH_1);
  body.setAttributeNS(null, 'stroke', BLACK);

  let label = document.createElementNS(SVG_URI, 'text');
  label.setAttributeNS(null, 'class', "label");
  label.setAttributeNS(null, 'x', v.x);
  label.setAttributeNS(null, 'y', v.y);
  let text = document.createTextNode(v.val);
  label.appendChild(text);
  
  group.appendChild(body);
  group.appendChild(label);

  svgVertices = getSvgVertices();
  svgVertices.appendChild(group);

  addVertexEventListeners(group);
};

let addVertex = (x, y) => {
  let vertex = Vertex(x, y, vertexIdSpeficier++);
  vertices.push(vertex);
  addVertexToSvg(vertex);
  return vertex;
};

let clearChild = (p) => {
  while (p.firstChild) {
    p.removeChild(p.firstChild);
  }
};

let resetButton = () => {
  save();
  reset();
};

let reset = () => {
  vertices = [];
  edges = [];
  vertexIdSpeficier = 0;
  edgeIdSpeficier = 1;
  clearChild(getSvgVertices());
  clearChild(getSvgEdges());
  currEdge = null;
  currVertex = null;
  resetTraversal();
};

let Vertex = (x, y, id) => {
  return {
    id: id,
    val: id,
    x: x,
    y: y,
  };
};

let getVertexBody = (v) => {
  for (let child of v.children) {
    if (child.getAttributeNS(null, 'class') == 'body') {
      return child;
    }
  }
  return null;
};

let getEdgeBody = (e) => {
  for (let child of e.children) {
    if (child.getAttributeNS(null, 'class') == 'body') {
      return child;
    }
  }
  return null;
};

let getEdgeHead = (e) => {
  for (let child of e.children) {
    if (child.getAttributeNS(null, 'class') == 'head') {
      return child;
    }
  }
  return null;
};

let getEdgeTail = (e) => {
  for (let child of e.children) {
    if (child.getAttributeNS(null, 'class') == 'tail') {
      return child;
    }
  }
  return null;
};

let getEdgeEdgeWeight = (e) => {
  for (let child of e.children) {
    if (child.getAttributeNS(null, 'class') == 'edgeweight') {
      return child;
    }
  }
  return null;
};

let getVertexLabel = (v) => {
  for (let child of v.children) {
    if (child.getAttributeNS(null, 'class') == 'label') {
      return child;
    }
  }
  return null;
};

let Edge = (v, id, isBidirected) => {
  return {
    id: id,
    v1: v.id,
    v2: null,
    x1: v.x,
    y1: v.y,
    x2: v.x,
    y2: v.y,
    isBidirected: isBidirected,
    edgeWeight: 0,
  };
};

let Edge2v = (v1, v2, id, isBidirected) => {
  return {
    id: id,
    v1: v1.id,
    v2: v2.id,
    x1: v1.x,
    y1: v1.y,
    x2: v2.x,
    y2: v2.y,
    isBidirected: isBidirected,
    edgeWeight: 0,
  };
};

let dist = (x1, y1, x2, y2) => {
  return Math.hypot(x1 - x2, y1 - y2);
};

let deleteEdgeListener = (e) => {
  return (event) => {
    event.preventDefault();
    save();
    resetTraversal();
    removeEdgeFromEdges(e);
    removeEdgeFromSvgEdges(e);
  };
};

let point = (x, y) => {
  return { x: x, y: y };
};

let vec = (x, y) => {
  return { x: x, y: y };
};

let toVec = (p1, p2) => {
  return vec(p2.x-p1.x, p2.y-p1.y);
};

let dot = (a, b) => {
  return a.x*b.x + a.y*b.y;
};

let norm_sq = (v) => {
  return v.x*v.x + v.y*v.y;
};

let angle = (a, o, b) => {
  let oa = toVec(o, a);
  let ob = toVec(o, b);
  return Math.acos(dot(oa, ob)/Math.sqrt(norm_sq(oa)*norm_sq(ob)));
};

let getEdgeSvgParams = (e) => {
  // edge weight
  let x1 = (e.x1>e.x2) ? e.x1 : e.x2;
  let y1 = (e.x1>e.x2) ? e.y1 : e.y2;
  let x2 = (e.x1>e.x2) ? e.x2 : e.x1;
  let y2 = (e.x1>e.x2) ? e.y2 : e.y1;
  
  let H = 3;
  let dy = Math.abs(y1 - y2);
  let dx = Math.abs(x1 - x2);
  let beta = Math.atan(dy/dx);
  let d = Math.sqrt(dy*dy + dx*dx);
  let x = (x1 + x2) / 2;
  let y = (y1 + y2) / 2;
  let yw = y - H*Math.cos(beta);
  let xw = (y1>y2) ? x + H*Math.sin(beta) : x - H*Math.sin(beta);
  let rotate = (y1>y2) ? beta*180/Math.PI : -beta*180/Math.PI;

  if (Number.isNaN(xw)) xw = -100;
  if (Number.isNaN(yw)) yw = -100;
  if (Number.isNaN(rotate)) rotate = 0;

  x1 = e.x1, y1 = e.y1, x2 = e.x2, y2 = e.y2;

  let p1 = point(1, 0);
  let p2 = point(0, 0);
  let p3 = point(x2-x1, y1-y2);

  let alpha = (y1>y2) ? -angle(p1, p2, p3) : angle(p1, p2, p3);

  let xh = x2 - VERTEX_RADIUS*Math.cos(alpha);
  let yh = y2 - VERTEX_RADIUS*Math.sin(alpha);

  let theta = alpha + Math.PI;
  let xt = x1 - VERTEX_RADIUS*Math.cos(theta);
  let yt = y1 - VERTEX_RADIUS*Math.sin(theta);

  return {
    xw: xw,
    yw: yw,
    aw: rotate,

    h: ARROW_HEIGHT_1,
    b: ARROW_BASE_1,

    xh: xh,
    yh: yh,
    ah: alpha*180/3.14,

    xt: xt,
    yt: yt,
    at: theta*180/3.14,
  };
};

let addEdgeToSvg = (e) => {
  let group = document.createElementNS(SVG_URI, 'g');
  group.setAttributeNS(null, 'class', "edge");
  group.setAttributeNS(null, 'id', e.id);

  let body = document.createElementNS(SVG_URI, 'line');
  body.setAttributeNS(null, 'class', "body");
  body.setAttributeNS(null, 'id', e.id);
  body.setAttributeNS(null, 'x1', e.x1);
  body.setAttributeNS(null, 'y1', e.y1);
  body.setAttributeNS(null, 'x2', e.x2);
  body.setAttributeNS(null, 'y2', e.y2);
  body.setAttributeNS(null, 'stroke-width', STROKE_WIDTH_1);
  body.setAttributeNS(null, 'stroke', BLACK);
  
  let E = getEdgeSvgParams(e);

  let edgeweight = document.createElementNS(SVG_URI, 'text');
  edgeweight.setAttributeNS(null, 'class', "edgeweight");
  edgeweight.setAttributeNS(null, 'transform', "translate("+E.xw+","+E.yw+") rotate("+E.aw+")");
  edgeweight.innerHTML = (e.edgeWeight + e.id) % 5 + 1;
  
  let head = document.createElementNS(SVG_URI, 'polygon');
  head.setAttributeNS(null, 'class', "head");
  head.setAttributeNS(null, 'fill', BLACK);
  head.setAttributeNS(null, "points", "0,0 " + (-E.h)+","+(E.b/2) + " " + (-E.h)+","+(-E.b/2));
  head.setAttributeNS(null, 'transform', "translate("+E.xh+","+E.yh+") rotate("+E.ah+")");
  
  let tail = document.createElementNS(SVG_URI, 'polygon');
  tail.setAttributeNS(null, 'class', "tail");
  tail.setAttributeNS(null, 'fill', BLACK);
  tail.setAttributeNS(null, "points", "0,0 " + (-E.h)+","+(E.b/2) + " " + (-E.h)+","+(-E.b/2));
  tail.setAttributeNS(null, 'transform', "translate("+E.xt+","+E.yt+") rotate("+E.at+")");
  
  // group.appendChild(edgeweight);
  group.appendChild(body);
  group.appendChild(head);
  group.appendChild(tail);
  getSvgEdges().appendChild(group);
  group.addEventListener('contextmenu', deleteEdgeListener(e));
};

let addEdge = (v, isBidirected) => {
  let edge = Edge(v, edgeIdSpeficier++, isBidirected);
  edges.push(edge);
  addEdgeToSvg(edge);
  return edge;
};

let addEdge2v = (v1, v2, isBidirected) => {
  // strictly dev use only
  let edge = Edge2v(v1, v2, edgeIdSpeficier++, isBidirected);
  edges.push(edge);
  addEdgeToSvg(edge);
  return edge;
}

let isOverVertex = (x, y) => {
  for (let v of vertices) {
    let d = dist(x, y, v.x, v.y);
    if (d <= VERTEX_RADIUS) {
      return v;
    }
  }
  return null;
};

let updateEdgeSvg = (e) => {
  let svgEdges = getSvgEdges();
  for (let child of svgEdges.children) {
    if (child.getAttributeNS(null, 'id') == e.id) {
      /* however many attributes required */
      let body = getEdgeBody(child);
      let head = getEdgeHead(child);
      let tail = getEdgeTail(child);
      let edgeweight = getEdgeEdgeWeight(child);

      body.setAttributeNS(null, 'x1', e.x1);
      body.setAttributeNS(null, 'y1', e.y1);
      body.setAttributeNS(null, 'x2', e.x2);
      body.setAttributeNS(null, 'y2', e.y2);

      let E = getEdgeSvgParams(e);

      if (head) head.setAttributeNS(null, 'transform', "translate("+E.xh+","+E.yh+") rotate("+E.ah+")");
      if (head) tail.setAttributeNS(null, 'transform', "translate("+E.xt+","+E.yt+") rotate("+E.at+")");
      if (edgeweight) edgeweight.setAttributeNS(null, 'transform', "translate("+E.xw+","+E.yw+") rotate("+E.aw+")");

      break;
    }
  }
};

let getCurrEgde = () => {
  for (let edge of edges) {
    if (edge.id == currEdge) {
      return edge;
    }
  }
  return null;
};

let updateCurrEdge = (x, y) => {
  let edge = getCurrEgde();
  edge.x2 = x;
  edge.y2 = y;
  updateEdgeSvg(edge);
};

// can afford to tidy here
let endEdgeUpdate = (v) => {
  let edge = getCurrEgde();
  edge.v2 = v.id;
  edge.x2 = v.x;
  edge.y2 = v.y;
  updateEdgeSvg(edge);

  let existing = null;
  let complement = null;

  for (let e of edges) {
    if (e.id == edge.id) continue;
    if (e.v1 == edge.v1 && e.v2 == edge.v2) {
      existing = e;
    }
    if (e.v2 == edge.v1 && e.v1 == edge.v2) {
      complement = e;
    }
  }

  // new edge entirely
  if (!existing && !complement) return;

  // all prevous edges inferior
  if (edge.isBidirected) {
    if (existing) {
      removeEdgeFromEdges(existing);
      removeEdgeFromSvgEdges(existing);
    }
    if (complement) {
      removeEdgeFromEdges(complement);
      removeEdgeFromSvgEdges(complement);
    }
    return;
  }

  // remove current edge
  if ((existing && existing.isBidirected)
    || (complement && complement.isBidirected)) {
    removeEdgeFromEdges(edge);
    removeEdgeFromSvgEdges(edge);
    return;
  }

  // duplicate
  if (existing) {
    removeEdgeFromEdges(edge);
    removeEdgeFromSvgEdges(edge);
    return;
  }

  // remove curr and make complement, bidirected
  if (complement) {
    removeEdgeFromEdges(edge);
    removeEdgeFromSvgEdges(edge);

    complement.isBidirected = true;
    removeEdgeFromSvgEdges(complement);
    addEdgeToSvg(complement);
    return;
  }
};

let deleteCurrEdge = () => {
  history.pop();
  edges = edges.filter(e => e.id != currEdge);
  let svgEdges = getSvgEdges();
  for (let edge of svgEdges.children) {
    if (edge.getAttributeNS(null, 'id') == currEdge) {
      svgEdges.removeChild(edge);
    }
  }
};

let svgContextMenuListener = (e) => {
  e.preventDefault();
  if (currEdge) {
    deleteCurrEdge();
    currEdge = null;
  }
};

let svgMouseMoveListener = (e) => {
  if (!currEdge) return;
  let loc = getSvgLoc(e);
  updateCurrEdge(loc.x, loc.y);
};

let svgClickListener = (e) => {
  let loc = getSvgLoc(e);
  let v = isOverVertex(loc.x, loc.y);

  /* if not over vertex, create a vertex */
  if (!v) {
    if (!currEdge) {
      save();
      addVertex(loc.x, loc.y);
    } else {
      deleteCurrEdge();
      currEdge = null;
    }
    return;
  }

  /* start edge creation */
  if (!currEdge) {
    save();
    let edge = addEdge(v, isBidirectedEdge());
    currEdge = edge.id;
    return;
  }

  /* end edge creation at curr v*/
  if (v.id == getCurrEgde().v1) {
    deleteCurrEdge();
  }
  else endEdgeUpdate(v);
  currEdge = null;
};

let addSvgEventListeners = () => {
  svg.addEventListener("click", svgClickListener);
  svg.addEventListener("mousemove", svgMouseMoveListener);
  svg.addEventListener("contextmenu", svgContextMenuListener);
};

let loadSampleGraph1 = () => {
  save();
  reset();
  
  let H = parseInt(document.getElementById("quantity-1").value);
  
  let n = Math.floor(Math.pow(2, H+1) - 1);
  let xmax = 600;
  let ymax = 400;
  
  let h = ymax / (H + 1);
  let yoffset = h / 2;
  
  for (let i = 0; i < n; i++) {
    let level = Math.floor(Math.log2(i + 1));
    let w = xmax / (Math.floor(Math.pow(2, level)) + 1);
    addVertex(w * (i - (Math.pow(2, level) - 2)), yoffset + level * h);
  }
  
  for (let i = 0; i < n/2 - 1; i++) {
    addEdge2v(vertices[i], vertices[2*i + 1], true);
    addEdge2v(vertices[i], vertices[2*i + 2], true);
  }
};

let loadSampleGraph2 = () => {
  save();
  reset();
  let n = parseInt(document.getElementById("quantity-2").value);
  let r = 100 * (1 + n/30);
  let x = 300;
  let y = 200;
  
  let theta = - Math.PI / 2;
  for (let i = 0; i < n; i++) {
    addVertex(x + r * Math.cos(theta), y + r * Math.sin(theta));
    theta += 2 * Math.PI / n;
  }
  
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      addEdge2v(vertices[i], vertices[j], true);
    }
  }
};

let loadSampleGraph3 = () => {
  save();
  reset();
  let r = parseInt(document.getElementById("quantity-3r").value);
  let c = parseInt(document.getElementById("quantity-3c").value);
  let xmin = 100;
  let xmax = 500;
  let ymin = 50;
  let ymax = 350;
  let dx = c==1 ? 0 : (xmax - xmin) / (c-1);
  let dy = r==1 ? 0 : (ymax - ymin) / (r-1);
  
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      addVertex(xmin + j * dx, ymin + i * dy);
    }
  }
  
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      let u = i * c + j;
      if (j < c - 1) addEdge2v(vertices[u], vertices[u + 1], true);
      if (i < r - 1) addEdge2v(vertices[u], vertices[u + c], true);
    }
  }
};

let rand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

let loadRandomGraph = () => {
  save();
  reset();

  let n = parseInt(document.getElementById("quantity-4").value);
  let r = 5;
  let c = 5;
  n = Math.min(n, r * c);
  let A = Array(r).fill().map(() => Array(c).fill(false));
  
  let xmin = 100;
  let xmax = 500;
  let ymin = 50;
  let ymax = 350;
  let dx = (xmax - xmin) / (r-1);
  let dy = (ymax - ymin) / (c-1);

  for (let k = 0; k < n; k++) {
    let i = rand(0, r-1);
    let j = rand(0, c-1);
    while (A[i][j]) {
      i = rand(0, r-1);
      j = rand(0, c-1);
    } 
    A[i][j] = true;
    addVertex(xmin + i * dx, ymin + j * dy);
  }

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (Math.random() < 2/n) addEdge2v(vertices[i], vertices[j], true);
    }
  }
};

let loadTestGraph = () => {
  save();
  reset();

  let v0 = addVertex(300, 200);
  let v1 = addVertex(218.42105102539062, 133.71710205078125);
  let v2 = addVertex(300, 30);
  let v3 = addVertex(315.2631530761719, 268.4539489746094);
  let v4 = addVertex(130, 194.7697296142578);
  let v5 = addVertex(422.631591796875, 274.7697448730469);
  let v6 = addVertex(138.42105102539062, 278.9802551269531);
  let v7 = addVertex(60.52631759643555, 302.1381530761719);
  let v8 = addVertex(102.63157653808594, 26.348684310913086);
  let v9 = addVertex(172.1052703857422, 72.66447448730469);
  let v10 = addVertex(498.4210510253906, 188.45394897460938);
  let v11 = addVertex(567.8947143554688, 205.29605102539062);
  let v12 = addVertex(414.2105407714844, 26.348684310913086);
  let v13 = addVertex(220.5263214111328, 257.9276428222656);
  let v14 = addVertex(376.3157958984375, 354.7697448730469);
  let v15 = addVertex(360, 116);
  
  addEdge2v(v0, v1, true);
  addEdge2v(v1, v4, true);
  addEdge2v(v4, v7, true);
  addEdge2v(v4, v6, true);
  addEdge2v(v4, v13, true);
  addEdge2v(v13, v1, true);
  addEdge2v(v0, v15, true);
  addEdge2v(v15, v2, true);
  addEdge2v(v2, v8, true);
  addEdge2v(v2, v9, true);
  addEdge2v(v15, v12, true);
  addEdge2v(v2, v12, true);
  addEdge2v(v0, v3, true);
  addEdge2v(v3, v5, true);
  addEdge2v(v5, v10, true);
  addEdge2v(v5, v11, true);
  addEdge2v(v3, v14, true);
  addEdge2v(v14, v5, true);
};

let addDocumentEventListeners = () => {
  document.addEventListener("mousedown", (e) => {
    if (e.button != 1) return;
    e.preventDefault();
    e.stopPropagation();
  });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.keyCode == 90) {
      undo();
    }
    if (e.ctrlKey && e.keyCode == 89) {
      redo();
    }
  });
};

/* undo/redo feature */

let getVertex = (id) => {
  for (let vertex of vertices) {
    if (vertex.id == id) {
      return vertex;
    }
  }
  return null;
};

let copyVertex = (v) => {
  if (!v) return null;
  return Vertex(v.x, v.y, v.id);
};

let copyEdge = (e) => {
  if (!e) return null;
  return Edge2v(getVertex(e.v1), getVertex(e.v2), e.id, e.isBidirected);
};

let getState = () => {
  es = [];
  for (let edge of edges) {
    es.push(copyEdge(edge));
  }

  vl = [];
  for (let vertex of vertices) {
    vl.push(copyVertex(vertex));
  }

  return {
    "vertices": vl,
    "edges": es,
    "vertexIdSpeficier": vertexIdSpeficier,
    "edgeIdSpeficier": edgeIdSpeficier,
    "currEdge": copyEdge(currEdge),
    "currVertex": copyVertex(currVertex)
  };
};

let history = [];
let future = [];

let save = () => {
  currState = getState();
  history.push(currState);
  future = [];
};

let undo = () => {
  if (!history.length) {
    return;
  }
  currState = getState();
  future.push(currState);
  prevState = history.pop();
  load(prevState);
};

let redo = () => {
  if (!future.length) {
    return;
  }
  currState = getState();
  history.push(currState);
  nextState = future.pop();
  load(nextState);
};

let load = (state) => {
  reset();
  vertices = state["vertices"];
  edges = state["edges"];
  vertexIdSpeficier = state["vertexIdSpeficier"];
  edgeIdSpeficier = state["edgeIdSpeficier"];
  for (let v of vertices) {
    addVertexToSvg(v);
  }
  for (let e of edges) {
    addEdgeToSvg(e);
  }
};

/* graph algos */

let resetTraversal = () => {
  clearChild(getSvgVertices());
  clearChild(getSvgEdges());

  for (let vertex of vertices) {
    addVertexToSvg(vertex);
  }
  for (let edge of edges) {
    addEdgeToSvg(edge);
  }

  resetAnimations();
};

let dfs = () => {
  resetTraversal();

  let S = parseInt(document.getElementById("quantity-5").value);
  let n = vertices.length;

  let E = {};
  for (let vertex of vertices) {
    E[vertex.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    if (edge.isBidirected) {
      E[edge.v2][edge.v1] = edge;
    }
  }

  let vis = {};
  for (let vertex of vertices) {
    vis[vertex.id] = false;
  }

  let body = {};
  let svgVertices = getSvgVertices();
  for (let svgVertex of svgVertices.children) {
    body[svgVertex.id] = getVertexBody(svgVertex);
  }

  let edge = {};
  let svgEdges = getSvgEdges();
  for (let svgEdge of svgEdges.children) {
    edge[svgEdge.id] = svgEdge;
  }

  let DFS = (u, p) => {
    vis[u] = true;
    addVertexAnimation1(body[u], 300);
    for (let vertex of vertices) {
      let v = vertex.id;
      if (E[u][v] == null) continue;
      if (!vis[v]) {
        addEdgeAnimation1(edge[E[u][v].id], 300);
        DFS(v, u);
        addEdgeAnimation3(edge[E[u][v].id], 300);
        addVertexAnimation3(body[u], 300);
      } else if (v!=p) {
        addEdgeAnimation2(edge[E[u][v].id], 300);
      }
    }
    addVertexAnimation2(body[u], 300);
  };

  seqReverse.push(null);
  DFS(S, -1);
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

let bfs = () => {
  resetTraversal();

  let S = parseInt(document.getElementById("quantity-7").value);
  let n = vertices.length;

  let E = {};
  for (let vertex of vertices) {
    E[vertex.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    if (edge.isBidirected) {
      E[edge.v2][edge.v1] = edge;
    }
  }

  let vis = {};
  for (let vertex of vertices) {
    vis[vertex.id] = false;
  }

  let body = {};
  let svgVertices = getSvgVertices();
  for (let svgVertex of svgVertices.children) {
    body[svgVertex.id] = getVertexBody(svgVertex);
  }

  let edge = {};
  let svgEdges = getSvgEdges();
  for (let svgEdge of svgEdges.children) {
    edge[svgEdge.id] = svgEdge;
  }

  let BFS = (source) => {
    let selectedE = {};
    vis[source] = true;
    let queue = [source];
    addVertexAnimation1(body[source], 300);

    while (queue.length) {
      let q = [];
      while (queue.length) {
        let u = queue.shift();
        addVertexAnimation2(body[u], 300);
        for (let vertex of vertices) {
          let v = vertex.id;
          if (!E[u][v]) continue;
          if (selectedE[E[u][v].id]) continue;
          if (vis[v]) {
            addEdgeAnimation2(edge[E[u][v].id], 300);
            continue;
          }
          q.push(v);
          vis[v] = true;
          selectedE[E[u][v].id] = true;
          addEdgeAnimation4(edge[E[u][v].id], 300);
          addVertexAnimation1(body[v], 300);
        }
      }
      queue = q;
    }
  };

  seqReverse.push(null);
  BFS(S);
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

addDocumentEventListeners();
addSvgEventListeners();
loadTestGraph();

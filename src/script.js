let VERTEX_RADIUS = 20;
let SVG_URI = "http://www.w3.org/2000/svg";

let vertices = [];
let edges = [];
let vertexIdSpeficier = 0;
let edgeIdSpeficier = 1;
let svg = document.getElementById("viewbox");

/* edge creation variables */
let currEdge = null;

/* dragging variables */
let currVertex = null;

let getSvgLoc = (e) => {
  let pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

let getSvgVertices = () => {
  for (let child of svg.children) {
    if (child.getAttributeNS(null, 'class') == "vertices") {
      return child;
    }
  }
  return null;
};

let getSvgEdges = () => {
  for (let child of svg.children) {
    if (child.getAttributeNS(null, 'class') == "edges") {
      return child;
    }
  }
  return null;
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

      /* lasy refactor */
      let svgEdges = getSvgEdges();

      edgeList = edges.filter(e => e.v1 == v.id);
      for (let edge of edgeList) {
        edge.x1 = x;
        edge.y1 = y;
        for (let child of svgEdges.children) {
          if (child.getAttributeNS(null, 'id') == edge.id) {
            child.setAttributeNS(null, 'x1', x);
            child.setAttributeNS(null, 'y1', y);
            break;
          }
        }
      }

      edgeList = edges.filter(e => e.v2 == v.id);
      for (let edge of edgeList) {
        edge.x2 = x;
        edge.y2 = y;
        for (let child of svgEdges.children) {
          if (child.getAttributeNS(null, 'id') == edge.id) {
            child.setAttributeNS(null, 'x2', x);
            child.setAttributeNS(null, 'y2', y);
            break;
          }
        }
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
  
  /** testing animations in-place of css
  let animation = document.createElementNS(SVG_URI, 'animate');
  animation.setAttributeNS(null, 'attributeName', "fill");
  animation.setAttributeNS(null, 'values', "red;white;red");
  animation.setAttributeNS(null, 'dur', "2s");
  animation.setAttributeNS(null, 'repeatCount', "indefinite");
  body.appendChild(animation);
  */

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

  /* Sample vertex template
    <g class="vertex" id="vertex-0">
      <circle class="body" cx="100" cy="100" r="20"/>
      <text class="label" x="100" y="100"> 0 </text>
    </g>
  */
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
}

let getVertexLabel = (v) => {
  for (let child of v.children) {
    if (child.getAttributeNS(null, 'class') == 'label') {
      return child;
    }
  }
  return null;
}

let Edge = (v, id) => {
  return {
    id: id,
    v1: v.id,
    v2: null,
    x1: v.x,
    y1: v.y,
    x2: v.x,
    y2: v.y,
  };
};

let Edge2v = (v1, v2, id) => {
  return {
    id: id,
    v1: v1.id,
    v2: v2.id,
    x1: v1.x,
    y1: v1.y,
    x2: v2.x,
    y2: v2.y,
  };
};

let dist = (x1, y1, x2, y2) => {
  return Math.hypot(x1 - x2, y1 - y2);
};

let deleteEdgeListener = (e) => {
  return (event) => {
    event.preventDefault();
    save();
    removeEdgeFromEdges(e);
    removeEdgeFromSvgEdges(e);
  };
};

let addEdgeToSvg = (e) => {
  let edge = document.createElementNS(SVG_URI, 'line');
  edge.setAttributeNS(null, 'class', "edge");
  edge.setAttributeNS(null, 'id', e.id);
  edge.setAttributeNS(null, 'x1', e.x1);
  edge.setAttributeNS(null, 'y1', e.y1);
  edge.setAttributeNS(null, 'x2', e.x2);
  edge.setAttributeNS(null, 'y2', e.y2);

  let svgEdges = getSvgEdges();
  svgEdges.appendChild(edge);

  edge.addEventListener('contextmenu', deleteEdgeListener(e));
};

let addEdge = (v) => {
  let edge = Edge(v, edgeIdSpeficier++);
  edges.push(edge);
  addEdgeToSvg(edge);
  return edge;
};

let addEdge2v = (v1, v2) => {
  let edge = Edge2v(v1, v2, edgeIdSpeficier++);
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
      child.setAttributeNS(null, 'x2', e.x2);
      child.setAttributeNS(null, 'y2', e.y2);
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

let endEdgeUpdate = (v) => {
  let edge = getCurrEgde();
  edge.v2 = v.id;
  edge.x2 = v.x;
  edge.y2 = v.y;
  updateEdgeSvg(edge);
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
    let edge = addEdge(v);
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
    addEdge2v(vertices[i], vertices[2*i + 1]);
    addEdge2v(vertices[i], vertices[2*i + 2]);
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
      addEdge2v(vertices[i], vertices[j]);
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
      if (j < c - 1) addEdge2v(vertices[u], vertices[u + 1]);
      if (i < r - 1) addEdge2v(vertices[u], vertices[u + c]);
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
      if (Math.random() < 2/n) addEdge2v(vertices[i], vertices[j]);
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
  
  addEdge2v(v0, v1);
  addEdge2v(v1, v4);
  addEdge2v(v4, v7);
  addEdge2v(v4, v6);
  addEdge2v(v4, v13);
  addEdge2v(v13, v1);
  addEdge2v(v0, v15);
  addEdge2v(v15, v2);
  addEdge2v(v2, v8);
  addEdge2v(v2, v9);
  addEdge2v(v15, v12);
  addEdge2v(v2, v12);
  addEdge2v(v0, v3);
  addEdge2v(v3, v5);
  addEdge2v(v5, v10);
  addEdge2v(v5, v11);
  addEdge2v(v3, v14);
  addEdge2v(v14, v5);
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
  return Edge2v(getVertex(e.v1), getVertex(e.v2), e.id);
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

let dfs = () => {
  let speed = parseInt(document.getElementById("quantity-6").value);
  let max = parseInt(document.getElementById("quantity-6").max);
  let S = parseInt(document.getElementById("quantity-5").value);
  let n = vertices.length;

  let animationDelays = {};
  for (let vertex of vertices) {
    animationDelays[vertex.id] = [];
  }
  let edgeAnimationDelays1 = {};
  let edgeAnimationDelays2 = {};
  let edgeAnimationDelays3 = {};

  let E = {};
  for (let vertex of vertices) {
    E[vertex.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    E[edge.v2][edge.v1] = edge;
  }
  // console.log(E);

  let t = 0;
  let vis = {};
  for (let vertex of vertices) {
    vis[vertex.id] = false;
  }

  let addEdgeAnimationDelay = (dict, e, t) => {
    if (dict[e.id] == null) {
      dict[e.id] = [t];
    } else {
      dict[e.id].push(t);
    }
  };

  let mult = 1 - (speed-1) * 0.965/9;
  let incr = 1.4 * mult;
  let t1 = 0.5 * mult;
  let t2 = 0.8 * mult;
  let t3 = 1.5 * mult;
  let t4 = 1 * mult

  let DFS = (u, p) => {
    console.log(u);
    animationDelays[u].push("" + t + "s");
    t += incr;
    vis[u] = true;

    for (let vertex of vertices) {
      let v = vertex.id;
      if (E[u][v] == null) continue;
      if (!vis[v]) {
        // light edge u -> v
        t -= t1;
        addEdgeAnimationDelay(edgeAnimationDelays1, E[u][v], "" + t + "s");
        t += incr - t2;
        DFS(v, u);
        // light edge v -> u
        t -= t1;
        addEdgeAnimationDelay(edgeAnimationDelays2, E[u][v], "" + t + "s");
        t += incr - t2;

        console.log(u);
        animationDelays[u].push("" + t + "s");
        t += incr;
      } else if (v != p) {
        console.log(u + " -> " + v);
        t -= t1;
        addEdgeAnimationDelay(edgeAnimationDelays3, E[u][v], "" + t + "s");
        t += incr + t1;
      }
    }
  };

  DFS(S, -1000);

  for (let vertex of vertices) {
    if (!vis[vertex.id]) continue;
    let delay = "";
    let animation = "";
    let c = "";
    let actual = "";
    let C = "";
    for (let s of animationDelays[vertex.id]) {
      actual = animation;
      animation += c + "glow " + t3 + "s";
      delay += c + s;
      C = c;
      c = ", ";
    }
    actual +=  C + "glow2 " + t3 + "s";
    // can definitely mimic the edge portion here
    let svgVertex = null;
    let svgVertices = getSvgVertices();
    for (let R of svgVertices.children) {
      if (R.getAttributeNS(null, 'id') == vertex.id) {
        svgVertex = R;
        break;
      }
    }
    let body = getVertexBody(svgVertex);
    body.style.animation  = actual;
    body.style.animationDelay  = delay;
    body.style.animationFillMode  = "forwards";
  }

  let svgEdges = getSvgEdges();
  for (let edge of svgEdges.children) {
    let delay = "";
    let animation = "";
    let c = "";
    let id = edge.getAttributeNS(null, 'id');
    if (edgeAnimationDelays1[id]) {
      for (let s of edgeAnimationDelays1[id]) {
        animation += c + "edgeglow " + t4 + "s";
        delay += c + s;
        c = ", ";
      }
    }
    if (edgeAnimationDelays2[id]) {
      for (let s of edgeAnimationDelays2[id]) {
        animation += c + "edgeglow2 " + t4 + "s";
        delay += c + s;
        c = ", ";
      }
    }
    if (edgeAnimationDelays3[id]) {
      for (let s of edgeAnimationDelays3[id]) {
        animation += c + "edgeglow3 " + t4 + "s";
        delay += c + s;
        c = ", ";
      }
    }
    edge.style.animation = animation;
    edge.style.animationDelay = delay;
    edge.style.animationFillMode = "forwards";
  }
};

let bfs = () => {
  let speed = parseInt(document.getElementById("quantity-8").value);
  let max = parseInt(document.getElementById("quantity-8").max);
  let S = parseInt(document.getElementById("quantity-7").value);
  let n = vertices.length;

  let animationDelays = {};
  let animationDelays2 = {};
  for (let vertex of vertices) {
    animationDelays[vertex.id] = [];
    animationDelays2[vertex.id] = [];
  }
  let edgeAnimationDelays1 = {};
  let edgeAnimationDelays2 = {};
  let edgeAnimationDelays3 = {};

  let E = {};
  for (let vertex of vertices) {
    E[vertex.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    E[edge.v2][edge.v1] = edge;
  }

  let t = 0;
  let vis = {};
  for (let vertex of vertices) {
    vis[vertex.id] = false;
  }

  let addEdgeAnimationDelay = (dict, e, t) => {
    if (dict[e.id] == null) {
      dict[e.id] = [t];
    } else {
      dict[e.id].push(t);
    }
  };

  let mult = 1 - (speed-1) * 0.965/9;
  let incr = 1.4 * mult;
  let t1 = 0.5 * mult;
  let t2 = 0.8 * mult;
  let t3 = 1.5 * mult;
  let t4 = 1 * mult

  // BFS
  let selectedE = {};

  let q = [S];
  vis[S] = true;
  animationDelays[S].push("" + t + "s");
  t += incr;
  animationDelays2[S].push("" + t + "s");
  t += incr;

  while (q.length) {

    let q2 = [];
    let doneV = [];
    let doneE = [];
    while (q.length) {
      let u = q.shift();
      console.log(u);
      for (let vertex of vertices) {
        let v = vertex.id;
        if (!E[u][v]) continue;
        if (selectedE[E[u][v].id]) continue;
        if (vis[v]) {
          t -= t1;
          addEdgeAnimationDelay(edgeAnimationDelays3, E[u][v], "" + t + "s");
          t += incr; // - t2;
          continue;
        }
        t -= t1;
        addEdgeAnimationDelay(edgeAnimationDelays1, E[u][v], "" + t + "s");
        t += incr - t2;

        animationDelays[v].push("" + t + "s");
        t += incr;
        
        doneV.push(v);
        doneE.push(E[u][v]);
        selectedE[E[u][v].id] = true;
        vis[v] = true;
        q2.push(v);
      }
    }

    q = q2;
    //t -= t1;
    for (let e of doneE) {
      addEdgeAnimationDelay(edgeAnimationDelays2, e, "" + t + "s");
    }
    t += incr - t2;
    for (let v of doneV) {
      animationDelays2[v].push("" + t + "s");
    }
    t += incr;

  }

  let svgVertices = getSvgVertices();
  for (let vertex of svgVertices.children) {
    if (!vis[vertex.id]) continue;
    let delay = "";
    let animation = "";
    let c = "";
    for (let s of animationDelays[vertex.id]) {
      actual = animation;
      animation += c + "glow " + t3 + "s";
      delay += c + s;
      c = ", ";
    }

    for (let s of animationDelays2[vertex.id]) {
      actual = animation;
      animation += c + "glow2 " + t3 + "s";
      delay += c + s;
      c = ", ";
    }

    let body = getVertexBody(vertex);
    body.style.animation  = animation;
    body.style.animationDelay  = delay;
    body.style.animationFillMode  = "forwards";
  }

  let svgEdges = getSvgEdges();
  for (let edge of svgEdges.children) {
    let delay = "";
    let animation = "";
    let c = "";
    let id = edge.getAttributeNS(null, 'id');
    if (edgeAnimationDelays1[id]) {
      for (let s of edgeAnimationDelays1[id]) {
        animation += c + "edgeglow " + t4 + "s";
        delay += c + s;
        c = ", ";
      }
    }
    if (edgeAnimationDelays2[id]) {
      for (let s of edgeAnimationDelays2[id]) {
        animation += c + "edgeglow2 " + t4 + "s";
        delay += c + s;
        c = ", ";
      }
    }
    if (edgeAnimationDelays3[id]) {
      for (let s of edgeAnimationDelays3[id]) {
        animation += c + "edgeglow3 " + t4 + "s";
        delay += c + s;
        c = ", ";
      }
    }
    edge.style.animation = animation;
    edge.style.animationDelay = delay;
    edge.style.animationFillMode = "forwards";
  }
};

let resetGraphAnimations = () => {
  let svgEdges = getSvgEdges();
  for (let edge of svgEdges.children) {
    edge.style.animation = "";
    edge.style.animationDelay = "";
    edge.style.animationFillMode = "";
  }
  let svgVertices = getSvgVertices();
  for (let svgVertex of svgVertices.children) {
    let body = getVertexBody(svgVertex);
    body.style.animation = "";
    body.style.animationDelay = "";
    body.style.animationFillMode = "";
  }
};

let states = [];
let index = 0;

let dfsClickable = () => {
  // let svgVertices = getSvgVertices();
  // for (let vertex of svgVertices.children) {
  //   let body = getVertexBody(vertex);
  //   let animation = document.createElementNS(SVG_URI, 'animate');
  //   animation.setAttributeNS(null, 'attributeName', "fill");
  //   animation.setAttributeNS(null, 'values', "white;red");
  //   animation.setAttributeNS(null, 'dur', "5s");
  //   animation.setAttributeNS(null, 'repeatCount', "1");
  //   body.appendChild(animation);
  // }

  for (let vertex of svgVertices.children) {
    
  }
};

let left = () => {

};

let right = () => {
  let svgVertices = getSvgVertices();
  let vertex = svgVertices.children[index];
  let body = getVertexBody(vertex);
  let animation = document.createElementNS(SVG_URI, 'animate');
  animation.setAttributeNS(null, 'attributeName', "fill");
  animation.setAttributeNS(null, 'values', "red;white;red");
  animation.setAttributeNS(null, 'dur', "5s");
  animation.setAttributeNS(null, 'repeatCount', "indefinite");
  body.appendChild(animation);
  index++;
};

addDocumentEventListeners();
addSvgEventListeners();
// loadSampleGraph1();
loadTestGraph();

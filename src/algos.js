const inf = 2e9 + 7;

let resetTraversal = () => {
  clearChild(getSvgVertices());
  clearChild(getSvgEdges());

  let olv = $('.ol-vertices');
  if (olv) olv.parentNode.removeChild(olv);

  for (let vertex of vertices) {
    addVertexToSvg(vertex);
  }
  for (let edge of edges) {
    addEdgeToSvg(edge);
  }

  resetAnimations();
  removePseudocode();

  xpos = [], ypos = [];
  svgOLVertices = {};
};

let dfs = () => {
  resetTraversal();
  genDfsPseudocode();

  let S = parseInt(document.getElementById("quantity-5").value);
  let n = vertices.length;

  let E = {};
  for (let v of vertices) {
    E[v.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    if (edge.isBidirected) {
      E[edge.v2][edge.v1] = edge;
    }
  }

  let vis = {};
  for (let v of vertices) {
    vis[v.id] = false;
  }

  let vertex = {};
  let svgVertices = getSvgVertices();
  for (let svgVertex of svgVertices.children) {
    vertex[svgVertex.id] = svgVertex;
  }

  let edge = {};
  let svgEdges = getSvgEdges();
  for (let svgEdge of svgEdges.children) {
    edge[svgEdge.id] = svgEdge;
  }

  let faded = {};

  let DFS = (u, p) => {
    vis[u] = true;
    let l = p == -1 ? [0,1] : [0,1,4]; 
    addVertexAnimation1(vertex[u], 300, null, null, l); // N->R
    for (let node of vertices) {
      let v = node.id;
      if (E[u][v] == null) continue;
      if (!vis[v]) {
        addEdgeAnimation1(edge[E[u][v].id], 300, [2]); // N->R
        DFS(v, u);
        addEdgeAnimation3(edge[E[u][v].id], 300, [5]); // R->G
        addVertexAnimation3(vertex[u], 300, null, null, [5]); // R->R
      } else if (v!=p && !faded[E[u][v].id]) {
        addEdgeAnimation1(edge[E[u][v].id], 300, [2]); // N->R
        addEdgeAnimation12(edge[E[u][v].id], 300, [3]); // R->F
        faded[E[u][v].id] = true;
      }
    }
    addVertexAnimation2(vertex[u], 300, null, null, [6]); // R->G
  };

  seqReverse.push(null);
  DFS(S, -1);
  addDummyAnimation(300, [8]);
  seqForward.push(null);
  seqLine.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

let bfs = () => {
  resetTraversal();
  genBfsPseudocode();

  let S = parseInt(document.getElementById("quantity-7").value);
  let n = vertices.length;

  let E = {};
  for (let v of vertices) {
    E[v.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    if (edge.isBidirected) {
      E[edge.v2][edge.v1] = edge;
    }
  }

  let vis = {};
  for (let v of vertices) {
    vis[v.id] = false;
  }

  let vertex = {};
  let svgVertices = getSvgVertices();
  for (let svgVertex of svgVertices.children) {
    vertex[svgVertex.id] = svgVertex;
  }

  let edge = {};
  let svgEdges = getSvgEdges();
  for (let svgEdge of svgEdges.children) {
    edge[svgEdge.id] = svgEdge;
  }

  let faded = {};

  let BFS = (source) => {
    let selectedE = {};
    vis[source] = true;
    let queue = [source];
    addVertexAnimation1(vertex[source], 300, null, null, [0,1,2]); // N->R

    while (queue.length) {
      let q = [];
      while (queue.length) {
        let u = queue.shift();
        addVertexAnimation2(vertex[u], 300, null, null, [4,5]); // R->G
        for (let node of vertices) {
          let v = node.id;
          if (!E[u][v]) continue;
          if (selectedE[E[u][v].id]) continue;
          if (vis[v] && !faded[E[u][v].id]) {
            addEdgeAnimation4(edge[E[u][v].id], 300, [6]); // N->G
            addEdgeAnimation13(edge[E[u][v].id], 300, [10]); // G->F
            faded[E[u][v].id] = true;
            continue;
          } else if (vis[v]) continue;
          q.push(v);
          vis[v] = true;
          selectedE[E[u][v].id] = true;
          addEdgeAnimation4(edge[E[u][v].id], 300, [6]); // N->G
          addVertexAnimation1(vertex[v], 300, null, null, [7,8,9]); // N->R
        }
      }
      queue = q;
    }
  };

  seqReverse.push(null);
  BFS(S);
  addDummyAnimation(300, [12]);
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

let getVertexDist = (v) => {
  for (let child of v.children) {
    if (child.getAttributeNS(null, 'class') == 'dist') {
      return child;
    }
  }
  return null;
};

let addDistances = () => {
  let svgVertices = getSvgVertices();
  for (let svgVertex of svgVertices.children) {
    let v = vertices.filter(u => u.id == svgVertex.id)[0];
    let dist = document.createElementNS(SVG_URI, 'text');
    dist.setAttributeNS(null, 'class', 'dist');
    dist.setAttributeNS(null, 'x', v.x);
    dist.setAttributeNS(null, 'y', v.y + VERTEX_DIST_Y_OFFSET);
    dist.setAttributeNS(null, 'fill', RED);
    let text = document.createTextNode("∞");
    dist.appendChild(text);
    svgVertex.appendChild(dist);
  }
};

let xpos = [], ypos = [];
let svgOLVertices = {};
let addOrderedListVertices = () => {
  let olVertices = document.createElementNS(SVG_URI, 'g');
  olVertices.setAttributeNS(null, 'class', "ol-vertices");

  /* schema for positioning vertices */
  let n = vertices.length;
  let y0 = 1.5 * VERTEX_RADIUS;
  let x0 = 1.5 * VERTEX_RADIUS;

  /* forgive me */
  let dx = n < 12 ? (600-3*VERTEX_RADIUS)/10 : (600-3*VERTEX_RADIUS)/(n-1);

  xpos = [], ypos = [];
  for (let i = 0; i < n; i++) {
    xpos.push(x0 + dx * i);
    ypos.push(y0);
  }

  svgOlVertices = {};
  for (let i = 0; i < n; i++) {
    let v = vertices[i];
    let group = document.createElementNS(SVG_URI, 'g');
    group.setAttributeNS(null, 'class', "vertex");  // consider changing to style differently
    group.setAttributeNS(null, 'id', v.id);
    
    let body = document.createElementNS(SVG_URI, 'circle');
    body.setAttributeNS(null, 'class', "body");
    body.setAttributeNS(null, 'cx', xpos[i]);
    body.setAttributeNS(null, 'cy', y0);
    body.setAttributeNS(null, 'r', VERTEX_RADIUS);
    body.setAttributeNS(null, 'fill', WHITE);
    body.setAttributeNS(null, 'stroke-width', STROKE_WIDTH_1);
    body.setAttributeNS(null, 'stroke', BLACK);

    let label = document.createElementNS(SVG_URI, 'text');
    label.setAttributeNS(null, 'class', "label");
    label.setAttributeNS(null, 'x', xpos[i]);
    label.setAttributeNS(null, 'y', y0);
    let text = document.createTextNode(v.val);
    label.appendChild(text);

    let dist = document.createElementNS(SVG_URI, 'text');
    dist.setAttributeNS(null, 'class', 'dist');
    dist.setAttributeNS(null, 'x', xpos[i]);
    dist.setAttributeNS(null, 'y', y0 + VERTEX_DIST_Y_OFFSET);
    dist.setAttributeNS(null, 'fill', RED);
    let dtext = document.createTextNode("∞");
    dist.appendChild(dtext);

    group.appendChild(dist);
    group.appendChild(body);
    group.appendChild(label);

    olVertices.appendChild(group);

    svgOLVertices[v.id] = group;
  }

  svg.appendChild(olVertices);
};

/*
  The ordered list should be updated whenever a colour
  change occurs for a vertex.
  The same animation will apply to the vertex.
*/
let updateOrderedList = (ol) => {
  ol.sort((u, v) => D[u] - D[v]);
  out = [];
  for (let u of ol) out.push([u, D[u]]);
  console.log(out);
};

let SSSP_SOURCE = -1;
let dijkstra = () => {
  resetTraversal();
  genDijkstrasPseudocode();

  if (!isShowingEdgeWeights()) {
    $('.edgeweight-switch').checked = true;
    showEdgeWeights();
  }

  let S = parseInt(document.getElementById("quantity-8").value);
  let n = vertices.length;

  let E = {};
  for (let v of vertices) {
    E[v.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    if (edge.isBidirected) {
      E[edge.v2][edge.v1] = edge;
    }
  }

  let D = {};
  for (let v of vertices) {
    D[v.id] = inf;
  }

  let vertex = {};
  let svgVertices = getSvgVertices();
  for (let child of svgVertices.children) {
    vertex[child.id] = child;
  }

  let edge = {};
  let svgEdges = getSvgEdges();
  for (let svgEdge of svgEdges.children) {
    edge[svgEdge.id] = svgEdge;
  }

  SSSP_SOURCE = S;

  let faded = {};

  /* designed for +ve edge weights only */
  let DIJKSTRA = (source) => {
    let p = {};
    let edgeParent = {};
    let pq = [];
    for (let v of vertices) pq.push(v.id);

    addVertexAnimation5(vertex[source], 300, D[source], 0, [5]);
    D[source] = 0;
    p[source] = -1;

    let ol = [];
    for (let v of vertices) ol.push(v.id);

    while (pq.length) {

      let u = pq.sort((u, v) => D[u] - D[v]).shift(); // my awesome heap

      if (D[u] != inf) addVertexAnimation6(vertex[u], 300, D[u], D[u], [7,8]);
      else addVertexAnimation7(vertex[u], 300, D[u], D[u], [7,8]);

      for (let node of vertices) {
        let v = node.id;
        if (!E[u][v]) continue;

        if (D[u] + E[u][v].edgeWeight < D[v]) {
          
          if (edgeParent[v]) {
            addDoubleEdgeAnimation1(edge[E[u][v].id], edge[edgeParent[v].id], 300, [10])
            faded[edgeParent[v].id] = true;
          } else addEdgeAnimation5(edge[E[u][v].id], 300, [10]);

          if (D[v]==inf) addVertexAnimation5(vertex[v], 300, D[v], D[u] + E[u][v].edgeWeight, [11,12,13]);
          else addVertexAnimation8(vertex[v], 300, D[v], D[u] + E[u][v].edgeWeight, [11,12,13]);
          D[v] = D[u] + E[u][v].edgeWeight;
          
          p[v] = u;
          edgeParent[v] = E[u][v];

        } else if (v != p[u]) {
          if (!faded[E[u][v].id]) {
            if (D[u] == inf) {
              addEdgeAnimation1(edge[E[u][v].id], 300, [10]); // N->R
              addEdgeAnimation12(edge[E[u][v].id], 300, [14]); // R->F
            } else {
              addEdgeAnimation5(edge[E[u][v].id], 300, [10]); // N->B
              addEdgeAnimation9(edge[E[u][v].id], 300, [14]);  // B->F
            }
            faded[E[u][v].id] = true;
          } else {
            if (D[u] == inf) {
              addEdgeAnimation14(edge[E[u][v].id], 300, [10]); // F->R
              addEdgeAnimation12(edge[E[u][v].id], 300, [14]); // R->F
            } else {
              addEdgeAnimation10(edge[E[u][v].id], 300, [10]); // F->B
              addEdgeAnimation9(edge[E[u][v].id], 300, [14]);  // B->F
            }
          }
        }
      }
    }
  };

  addDistances();
  addOrderedListVertices();

  seqReverse.push(null);
  addDummyAnimation(300, [0,1,2,3])
  DIJKSTRA(S);
  addDummyAnimation(300, [16])
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

let bellmanford = () => {
  resetTraversal();
  genBellmanFordPseudocode();

  if (!isShowingEdgeWeights()) {
    $('.edgeweight-switch').checked = true;
    showEdgeWeights();
  }

  let S = parseInt(document.getElementById("quantity-9").value);
  let n = vertices.length;

  let E = {};
  for (let v of vertices) {
    E[v.id] = {};
  }
  for (let edge of edges) {
    E[edge.v1][edge.v2] = edge;
    if (edge.isBidirected) {
      E[edge.v2][edge.v1] = edge;
    }
  }

  let D = {};
  for (let v of vertices) {
    D[v.id] = inf;
  }

  let vertex = {};
  let svgVertices = getSvgVertices();
  for (let child of svgVertices.children) {
    vertex[child.id] = child;
  }

  let edge = {};
  let svgEdges = getSvgEdges();
  for (let svgEdge of svgEdges.children) {
    edge[svgEdge.id] = svgEdge;
  }

  SSSP_SOURCE = S;

  let faded = {};
  let red = {};

  /* designed for +ve edge weights only */
  let BELLMANFORD = (source) => {
    let p = {};
    let edgeParent = {};

    addVertexAnimation9(vertex[source], 300, D[source], 0, [4]);
    D[source] = 0;
    p[source] = -1;

    for (let i = 0; i < n-1; i++) { // v-1 times
      addDummyAnimation(300, [6]);
      let relaxed = false;
      for (let node of vertices) {
        let u = node.id;
        let hasNeighbours = false;
        for (let node2 of vertices) {
          let v = node2.id;
          if (!E[u][v]) continue; hasNeighbours = true;

          if (D[u] + E[u][v].edgeWeight < D[v]) {
            relaxed = true;

            // 1. light u to blue, u will always be blue! blue+F -> blue+F
            addVertexAnimation10(vertex[u], 300, D[u], D[u], [7]);

            // 2. light edge.
            if (edgeParent[v] && u != p[v]) {
              if (!faded[E[u][v].id]) {
                addDoubleEdgeAnimation1(edge[E[u][v].id], edge[edgeParent[v].id], 300, [8]); // N->B, B->F
                faded[edgeParent[v].id] = true;
              } else {
                addDoubleEdgeAnimation2(edge[E[u][v].id], edge[edgeParent[v].id], 300, [8]); // F->B, B->F
                faded[E[u][v].id] = false;
                faded[edgeParent[v].id] = true;
              }
            } else if (u == p[v]) {
              addEdgeAnimation11(edge[E[u][v].id], 300, [8]); // B->B->B
            } else {
              if (!faded[E[u][v].id]) addEdgeAnimation5(edge[E[u][v].id], 300, [8]); // N->B
              else {
                addEdgeAnimation10(edge[E[u][v].id], 300, [8]); // F->B
                faded[E[u][v].id]  = false;
              }
            }

            let dv = D[u] + E[u][v].edgeWeight;

            // 3. light v to blue
            if (red[v]) {
              addVertexAnimation11(vertex[v], 300, D[v], dv, [9,10]); // R->B
              red[v] = false;
            } else if (D[v] == inf) addVertexAnimation9(vertex[v], 300, D[v], dv, [9,10]); // N->B
            else addVertexAnimation10(vertex[v], 300, D[v], dv, [9,10]); // B->B

            D[v] = dv;
            p[v] = u;
            edgeParent[v] = E[u][v];
          
          } else if (v != p[u]) { // fade edge(u,v), Q: {u}? {uv}transition? {v}ignore

            // 1. light u, N->R or col(u)->col(u)
            if (D[u] == inf && !red[u]) {
              addVertexAnimation7(vertex[u], 300, D[u], D[u], [7]);
              red[u] = true;
            } else if (red[u]) addVertexAnimation12(vertex[u], 300, D[u], D[u], [7]); // R->R
            else addVertexAnimation10(vertex[u], 300, D[u], D[u], [7]); // B->B

            // 2. fade edge, if not highlighted
            if (faded[E[u][v].id]) {
              if (red[u]) {
                addEdgeAnimation14(edge[E[u][v].id], 300, [8]); // F->R
                addEdgeAnimation12(edge[E[u][v].id], 300, [11]); // R->F
              } else {
                addEdgeAnimation10(edge[E[u][v].id], 300, [8]); // F->B
                addEdgeAnimation9(edge[E[u][v].id], 300, [11]); // B->F
              }
            } else if (u != p[v]) { // edge not higlighted
              if (red[u]) {
                addEdgeAnimation1(edge[E[u][v].id], 300, [8]); // N->R
                addEdgeAnimation12(edge[E[u][v].id], 300, [11]); // R->F
              } else {
                addEdgeAnimation5(edge[E[u][v].id], 300, [8]);  // N->B
                addEdgeAnimation9(edge[E[u][v].id], 300, [11]); // B->F
              }
            } else {
              addEdgeAnimation11(edge[E[u][v].id], 300, [8]); // B->B->B
              addEdgeAnimation11(edge[E[u][v].id], 300, [11]); // B->B->B
              continue;
            }

            faded[E[u][v].id] = true;
          }
        }

        if (!hasNeighbours) {
          if (!red[u]) {
            addVertexAnimation7(vertex[u], 300, D[u], D[u], [7]); // N->R
            red[u] = true;
          } else addVertexAnimation12(vertex[u], 300, D[u], D[u], [7]); // R->R
        }
      }

      if (!relaxed) {
        addDummyAnimation(300, [13]);
        break;
      }
    }
  };

  addDistances();

  seqReverse.push(null);
  addDummyAnimation(300, [0,1,2])
  BELLMANFORD(S);
  addDummyAnimation(300, [15])
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

let removePseudocode = () => {
  let pc = $('.pseudocode');
  if (!pc) return;
  pc.parentNode.removeChild(pc);
};

/* help, is there a better way to do this... curse u whitespace collapsing */

let genDfsPseudocode = () => {
  let fs = document.createElement("fieldset");
  fs.setAttributeNS(null, 'class', "pseudocode");
  fs.innerHTML = "<legend>Pseudocode</legend>"
      + "<div class='code line-0 function-def'>DFS(u):</div>"
      + "<div class='code line-1'>&nbsp;&nbsp;&nbsp;&nbsp;mark u as visited</div>"
      + "<div class='code line-2'>&nbsp;&nbsp;&nbsp;&nbsp;for each neighbour v of u:</div>"
      + "<div class='code line-3'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v is visited, continue</div>"
      + "<div class='code line-4'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v is not visited, DFS(v)</div>"
      + "<div class='code line-5'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;backtrack to u</div>"
      + "<div class='code line-6'>&nbsp;&nbsp;&nbsp;&nbsp;done exploring u</div>"
      + "<div class='code line-7'>&nbsp;</div>"
      + "<div class='code line-8'>Finished</div>"
  $('.left-panel').appendChild(fs);
};

let genBfsPseudocode = () => {
  let fs = document.createElement("fieldset");
  fs.setAttributeNS(null, 'class', "pseudocode");
  fs.innerHTML = "<legend>Pseudocode</legend>"
      + "<div class='code line-0 function-def'>BFS(source):</div>"
      + "<div class='code line-1'>&nbsp;&nbsp;&nbsp;&nbsp;queue = [source]</div>"
      + "<div class='code line-2'>&nbsp;&nbsp;&nbsp;&nbsp;mark source as visited</div>"
      + "<div class='code line-3'>&nbsp;</div>"
      + "<div class='code line-4'>&nbsp;&nbsp;&nbsp;&nbsp;while !queue.empty():</div>"
      + "<div class='code line-5'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;u = queue.pop()</div>"
      + "<div class='code line-6'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each neighbour v of u:</div>"
      + "<div class='code line-7'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v is not visited:</div>"
      + "<div class='code line-8'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mark v as visited</div>"
      + "<div class='code line-9'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;queue.push(v)</div>"
      + "<div class='code line-10'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else if v is visited, continue</div>"
      + "<div class='code line-11'>&nbsp;</div>"
      + "<div class='code line-12'>Finished</div>"
  $('.left-panel').appendChild(fs);
};

let genDijkstrasPseudocode = () => {
  let fs = document.createElement("fieldset");
  fs.setAttributeNS(null, 'class', "pseudocode");
  fs.innerHTML = "<legend>Pseudocode</legend>"
      + "<div class='code line-0 function-def'>Dijkstras(source):</div>"
      + "<div class='code line-1'>&nbsp;&nbsp;&nbsp;&nbsp;for each v in V:</div>"
      + "<div class='code line-2'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D[v] = inf</div>"
      + "<div class='code line-3'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PQ.push(v)</div>"
      + "<div class='code line-4'>&nbsp;</div>"
      + "<div class='code line-5'>&nbsp;&nbsp;&nbsp;&nbsp;D[source] = 0</div>"
      + "<div class='code line-6'>&nbsp;</div>"
      + "<div class='code line-7'>&nbsp;&nbsp;&nbsp;&nbsp;while !PQ.empty():</div>"
      + "<div class='code line-8'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;u = PQ.pop()</div>"
      + "<div class='code line-9'>&nbsp;</div>"
      + "<div class='code line-10'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each neighbour v of u:</div>"
      + "<div class='code line-11'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if D[u] + edge(u, v) < D[v]:</div>"
      + "<div class='code line-12'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D[v] = D[u] + edge(u, v)</div>"
      + "<div class='code line-13'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;update PQ</div>"
      + "<div class='code line-14'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else, continue</div>"
      + "<div class='code line-15'>&nbsp;</div>"
      + "<div class='code line-16'>Finished</div>"
  $('.left-panel').appendChild(fs);
};

let genBellmanFordPseudocode = () => {
  let fs = document.createElement("fieldset");
  fs.setAttributeNS(null, 'class', "pseudocode");
  fs.innerHTML = "<legend>Pseudocode</legend>"
      + "<div class='code line-0 function-def'>BellmanFord(source):</div>"
      + "<div class='code line-1'>&nbsp;&nbsp;&nbsp;&nbsp;for each v in V:</div>"
      + "<div class='code line-2'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D[v] = inf</div>"
      + "<div class='code line-3'>&nbsp;</div>"
      + "<div class='code line-4'>&nbsp;&nbsp;&nbsp;&nbsp;D[source] = 0</div>"
      + "<div class='code line-5'>&nbsp;</div>"
      + "<div class='code line-6'>&nbsp;&nbsp;&nbsp;&nbsp;for v-1 times:</div>"
      + "<div class='code line-7'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each u in V:</div>"
      + "<div class='code line-8'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for each neighbour v of u:</div>"
      + "<div class='code line-9'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if D[u] + edge(u, v) < D[v]:</div>"
      + "<div class='code line-10'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D[v] = D[u] + edge(u, v)</div>"
      + "<div class='code line-11'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else, continue</div>"
      + "<div class='code line-12'>&nbsp;</div>"
      + "<div class='code line-13'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if no relaxations, break</div>"
      + "<div class='code line-14'>&nbsp;</div>"
      + "<div class='code line-15'>Finished</div>"
  $('.left-panel').appendChild(fs);
};

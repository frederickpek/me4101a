const inf = 2e9 + 7;

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
    addVertexAnimation1(vertex[u], 300);
    for (let node of vertices) {
      let v = node.id;
      if (E[u][v] == null) continue;
      if (!vis[v]) {
        addEdgeAnimation1(edge[E[u][v].id], 300);
        DFS(v, u);
        addEdgeAnimation3(edge[E[u][v].id], 300);
        addVertexAnimation3(vertex[u], 300);
      } else if (v!=p && !faded[E[u][v].id]) {
        addEdgeAnimation2(edge[E[u][v].id], 300);
        faded[E[u][v].id] = true;
      }
    }
    addVertexAnimation2(vertex[u], 300);
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
    addVertexAnimation1(vertex[source], 300);

    while (queue.length) {
      let q = [];
      while (queue.length) {
        let u = queue.shift();
        addVertexAnimation2(vertex[u], 300);
        for (let node of vertices) {
          let v = node.id;
          if (!E[u][v]) continue;
          if (selectedE[E[u][v].id]) continue;
          if (vis[v] && !faded[E[u][v].id]) {
            addEdgeAnimation2(edge[E[u][v].id], 300);
            faded[E[u][v].id] = true;
            continue;
          } else if (vis[v]) continue;
          q.push(v);
          vis[v] = true;
          selectedE[E[u][v].id] = true;
          addEdgeAnimation4(edge[E[u][v].id], 300);
          addVertexAnimation1(vertex[v], 300);
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

let SSSP_SOURCE = -1;
let dijkstra = () => {
  resetTraversal();

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

    addVertexAnimation5(vertex[source], 300, D[source], 0);
    D[source] = 0;
    p[source] = -1;

    while (pq.length) {

      let u = pq.sort((u, v) => D[u] - D[v]).shift(); // my awesome heap

      if (D[u] != inf) addVertexAnimation6(vertex[u], 300, D[u], D[u]);
      else addVertexAnimation7(vertex[u], 300, D[u], D[u]);

      for (let node of vertices) {
        let v = node.id;
        if (!E[u][v]) continue;

        if (D[u] + E[u][v].edgeWeight < D[v]) {
          
          if (edgeParent[v]) {
            addDoubleEdgeAnimation1(edge[E[u][v].id], edge[edgeParent[v].id], 300)
            faded[edgeParent[v].id] = true;
          } else addEdgeAnimation5(edge[E[u][v].id], 300);

          if (D[v]==inf) addVertexAnimation5(vertex[v], 300, D[v], D[u] + E[u][v].edgeWeight);
          else addVertexAnimation8(vertex[v], 300, D[v], D[u] + E[u][v].edgeWeight);
          D[v] = D[u] + E[u][v].edgeWeight;
          
          p[v] = u;
          edgeParent[v] = E[u][v];

        } else if (v != p[u]) {
          if (!faded[E[u][v].id]) {
            if (D[u] == inf) addEdgeAnimation2(edge[E[u][v].id], 300);
            else addEdgeAnimation6(edge[E[u][v].id], 300);
            faded[E[u][v].id] = true;
          } else {
            if (D[u] == inf) addEdgeAnimation8(edge[E[u][v].id], 300);
            else addEdgeAnimation7(edge[E[u][v].id], 300);
          }
        }
      }
    }
  };

  addDistances();

  seqReverse.push(null);
  DIJKSTRA(S);
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

let bellmanford = () => {
  resetTraversal();

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

    addVertexAnimation9(vertex[source], 300, D[source], 0);
    D[source] = 0;
    p[source] = -1;

    for (let i = 0; i < n-1; i++) { // v-1 times
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
            addVertexAnimation10(vertex[u], 300, D[u], D[u]);

            // 2. light edge.
            if (edgeParent[v] && u != p[v]) {
              if (!faded[E[u][v].id]) {
                addDoubleEdgeAnimation1(edge[E[u][v].id], edge[edgeParent[v].id], 300); // N->B, B->F
                faded[edgeParent[v].id] = true;
              } else {
                addDoubleEdgeAnimation2(edge[E[u][v].id], edge[edgeParent[v].id], 300); // F->B, B->F
                faded[E[u][v].id] = false;
                faded[edgeParent[v].id] = true;
              }
            } else if (u == p[v]) {
              addEdgeAnimation11(edge[E[u][v].id], 300); // B->B->B
            } else {
              if (!faded[E[u][v].id]) addEdgeAnimation5(edge[E[u][v].id], 300); // N->B
              else {
                addEdgeAnimation10(edge[E[u][v].id], 300); // F->B
                faded[E[u][v].id]  = false;
              }
            }

            let dv = D[u] + E[u][v].edgeWeight;

            // 3. light v to blue
            if (red[v]) {
              addVertexAnimation11(vertex[v], 300, D[v], dv); // R->B
              red[v] = false;
            } else if (D[v] == inf) addVertexAnimation9(vertex[v], 300, D[v], dv); // N->B
            else addVertexAnimation10(vertex[v], 300, D[v], dv); // B->B

            D[v] = dv;
            p[v] = u;
            edgeParent[v] = E[u][v];
          
          } else if (v != p[u]) { // fade edge(u,v), Q: {u}? {uv}transition? {v}ignore

            // 1. light u, N->R or col(u)->col(u)
            if (D[u] == inf && !red[u]) {
              addVertexAnimation7(vertex[u], 300, D[u], D[u]);
              red[u] = true;
            } else if (red[u]) addVertexAnimation12(vertex[u], 300, D[u], D[u]); // R->R
            else addVertexAnimation10(vertex[u], 300, D[u], D[u]); // B->B

            // 2. fade edge, if not highlighted

            if (faded[E[u][v].id]) {
              if (red[u]) addEdgeAnimation8(edge[E[u][v].id], 300); // F->R->F
              else addEdgeAnimation7(edge[E[u][v].id], 300); // F->B->F
            } else if (u != p[v]) { // edge not higlighted
              if (red[u]) addEdgeAnimation2(edge[E[u][v].id], 300); // N->R->F
              else addEdgeAnimation6(edge[E[u][v].id], 300); // N->B->F
            } else {
              addEdgeAnimation11(edge[E[u][v].id], 300); // B->B->B
              continue;
            }

            faded[E[u][v].id] = true;
          }
        }

        if (!hasNeighbours) {
          if (!red[u]) {
            addVertexAnimation7(vertex[u], 300, D[u], D[u]); // N->R
            red[u] = true;
          } else addVertexAnimation12(vertex[u], 300, D[u], D[u]); // R->R
        }
      }

      if (!relaxed) break;
    }
  };

  addDistances();

  seqReverse.push(null);
  BELLMANFORD(S);
  seqForward.push(null);

  progress.max = seqForward.length-1;
  play_pause();
};

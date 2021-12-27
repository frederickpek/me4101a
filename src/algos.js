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

let DIJKSTRA_SOURCE = -1;
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

  DIJKSTRA_SOURCE = S;

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

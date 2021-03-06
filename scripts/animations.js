const BLACK  = '#000000';
const BLUE   = '#2196F3';
const DBLUE  = '#1F6ED9';
const LBLUE  = '#85C1E9';
const GREEN  = '#0f9d57';
const DGREEN = '#00864F';
const RED    = '#db4437';
const DRED   = '#C63B2F';
const WHITE  = '#f0f0f0';
const FADE   = '#e6e6e6';

const STROKE_WIDTH_1 = 1.5;
const STROKE_WIDTH_2 = 4;
const STROKE_WIDTH_3 = 2;

const ARROW_BASE    = 5;
const ARROW_HEIGHT  = 10;

const ARROW_BASE_1 = 5;
const ARROW_BASE_2 = 9;
const ARROW_BASE_3 = 6;

const ARROW_HEIGHT_1 = 10;
const ARROW_HEIGHT_2 = 13;
const ARROW_HEIGHT_3 = 11;

let progress = document.querySelector('.progress');

let VERTEX_OBJ_1 = (d) => { return { stroke_width: STROKE_WIDTH_1, stroke: BLACK,  fill: WHITE,  dist: d }; };
let VERTEX_OBJ_2 = (d) => { return { stroke_width: STROKE_WIDTH_2, stroke: DRED,   fill: DRED,   dist: d }; };
let VERTEX_OBJ_3 = (d) => { return { stroke_width: STROKE_WIDTH_1, stroke: RED,    fill: RED,    dist: d }; };
let VERTEX_OBJ_4 = (d) => { return { stroke_width: STROKE_WIDTH_2, stroke: DGREEN, fill: DGREEN, dist: d }; };
let VERTEX_OBJ_5 = (d) => { return { stroke_width: STROKE_WIDTH_3, stroke: GREEN,  fill: GREEN,  dist: d }; };
let VERTEX_OBJ_6 = (d) => { return { stroke_width: STROKE_WIDTH_2, stroke: DBLUE,  fill: DBLUE,  dist: d }; };
let VERTEX_OBJ_7 = (d) => { return { stroke_width: STROKE_WIDTH_1, stroke: BLUE,   fill: WHITE,  dist: d }; };
let VERTEX_OBJ_8 = (d) => { return { stroke_width: STROKE_WIDTH_3, stroke: DBLUE,  fill: BLUE,   dist: d }; };
let VERTEX_OBJ_9 = (d) => { return { stroke_width: STROKE_WIDTH_1, stroke: RED,    fill: RED,    dist: d }; };

let EDGE_OBJ_1 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: BLACK, arrow_base: ARROW_BASE_1, arrow_height: ARROW_HEIGHT_1 }; };
let EDGE_OBJ_2 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: DRED,  arrow_base: ARROW_BASE_2, arrow_height: ARROW_HEIGHT_2 }; };
let EDGE_OBJ_3 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: RED,   arrow_base: ARROW_BASE_1, arrow_height: ARROW_HEIGHT_1 }; };
let EDGE_OBJ_4 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: FADE,  arrow_base: ARROW_BASE_1, arrow_height: ARROW_HEIGHT_1 }; };
let EDGE_OBJ_5 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: GREEN, arrow_base: ARROW_BASE_2, arrow_height: ARROW_HEIGHT_2 }; };
let EDGE_OBJ_6 = () => { return { stroke_width: STROKE_WIDTH_3, stroke: GREEN, arrow_base: ARROW_BASE_3, arrow_height: ARROW_HEIGHT_3 }; };
let EDGE_OBJ_7 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: DBLUE, arrow_base: ARROW_BASE_2, arrow_height: ARROW_HEIGHT_2 }; };
let EDGE_OBJ_8 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: BLUE,  arrow_base: ARROW_BASE_1, arrow_height: ARROW_HEIGHT_1 }; };

let generateVertexAnime = (targetSvg, initialObj, targetObjs, dur, oi, of, algo) => {
  let animation = anime.timeline({
      targets: initialObj,
      loop: false,
      autoplay: false,
      easing: "easeOutQuad",
      duration: dur
    });

  for (let targetObj of targetObjs) {
    let dijkstrasUpdateFunction = () => {
      let updateSvg = (svgObj) => {
        let body = getVertexBody(svgObj);
        body.setAttributeNS(null, 'fill', initialObj.fill);
        body.setAttributeNS(null, 'stroke', initialObj.stroke);
        body.setAttributeNS(null, 'stroke-width', initialObj.stroke_width);

        let dist = getVertexDist(svgObj);
        if (dist) {
          let d = animation.progress < 40 ? initialObj.dist : targetObj.dist;
          dist.firstChild.textContent = d == inf ? "???" : targetSvg.id == SSSP_SOURCE ? "Src:"+d : d;
        }
      }

      if (!targetSvg) return;
      updateSvg(targetSvg);
      if (!oi || !of) return;

      if (!svgOLVertices) return;

      let olv = svgOLVertices[targetSvg.id];
      if (!olv) return;
      updateSvg(olv);

      let n = vertices.length;

      let yposidx = {};
      for (let i = 0; i < n; i++) yposidx[of[i]] = i;

      for (let i = 0; i < n; i++) {
        let v = svgOLVertices[oi[i]];
        if (!v) return;

        let yi = ypos[i];
        let yf = ypos[yposidx[oi[i]]];
        let m = (yf-yi)/100; // animation.progress.max = 100, presumably
        if (m == 0) continue;
        let y = Math.min(Math.pow(animation.progress+1, 1.2), 100) * m + yi;
        let x = xpos[i];

        /* location changes */
        let body = getVertexBody(v);
        body.setAttributeNS(null, 'cx', x);
        body.setAttributeNS(null, 'cy', y);

        let label = getVertexLabel(v);
        label.setAttributeNS(null, 'x', x);
        label.setAttributeNS(null, 'y', y);

        let dist = getVertexDist(v);
        dist.setAttributeNS(null, 'x', x + VERTEX_DIST_X_OFFSET);
        dist.setAttributeNS(null, 'y', y);
      }
    };

    let dfsUpdateFunction = () => {
      let updateSvg = (svgObj) => {
        let body = getVertexBody(svgObj);
        body.setAttributeNS(null, 'fill', initialObj.fill);
        body.setAttributeNS(null, 'stroke', initialObj.stroke);
        body.setAttributeNS(null, 'stroke-width', initialObj.stroke_width);
      }

      if (!targetSvg) return;
      updateSvg(targetSvg);
      let olv = svgOLVertices[targetSvg.id];
      if (!olv) return;
      updateSvg(olv);

      // oi -> vertices that are in the stack initially
      // of -> vertices that are in the stack finally
      if (oi.length == of.length) return;

      const {_x, _y, width, height} = $("#linear-data-structure").viewBox.baseVal;
      let n = vertices.length;
      let y0 = height - 1.5 * VERTEX_RADIUS;
      let x0 = width / 2;

      // 1. gen x,y-posInitial with oi
      let dy = 2.5 * VERTEX_RADIUS;
      if (oi.length > Math.floor(height/dy)) {
        dy = (height - 2 * 1.5 * VERTEX_RADIUS) / (oi.length-1);
      }

      let xposi = {}, yposi = {};
      for (let i = 0; i < oi.length; i++) {
        xposi[oi[i]] = x0;
        yposi[oi[i]] = y0 - dy * i;
      }

      for (v of vertices) {
        if (xposi[v.id] || yposi[v.id]) continue;
        xposi[v.id] = x0;
        yposi[v.id] = - VERTEX_RADIUS * 2.5;
      }

      // 2. gen x,y-posFinal with of
      dy = 2.5 * VERTEX_RADIUS;
      if (of.length > Math.floor(height/dy)) {
        dy = (height - 2 * 1.5 * VERTEX_RADIUS) / (of.length-1);
      }

      let xposf = {}, yposf = {};
      for (let i = 0; i < of.length; i++) {
        xposf[of[i]] = x0;
        yposf[of[i]] = y0 - dy * i;
      }

      for (v of vertices) {
        if (xposf[v.id] || yposf[v.id]) continue;
        xposf[v.id] = x0;
        yposf[v.id] = - VERTEX_RADIUS * 2.5;
      }

      // 3. interpolate
      for (vertex of vertices) {
        let v = svgOLVertices[vertex.id];
        if (!v) return;

        let m = (yposf[v.id] - yposi[v.id])/100; // animation.progress.max = 100, presumably
        if (m == 0) continue;
        let y = Math.min(Math.pow(animation.progress+1, 1.2), 100) * m + yposi[v.id];
        let x = x0;

        /* location changes */
        let body = getVertexBody(v);
        body.setAttributeNS(null, 'cx', x);
        body.setAttributeNS(null, 'cy', y);

        let label = getVertexLabel(v);
        label.setAttributeNS(null, 'x', x);
        label.setAttributeNS(null, 'y', y);
      }
    };

    let bfsUpdateFunction = () => {
      let updateSvg = (svgObj) => {
        let body = getVertexBody(svgObj);
        body.setAttributeNS(null, 'fill', initialObj.fill);
        body.setAttributeNS(null, 'stroke', initialObj.stroke);
        body.setAttributeNS(null, 'stroke-width', initialObj.stroke_width);
      }

      if (!targetSvg) return;
      updateSvg(targetSvg);
      let olv = svgOLVertices[targetSvg.id];
      if (!olv) return;
      updateSvg(olv);

      // oi -> vertices that are in the stack initially
      // of -> vertices that are in the stack finally
      if (oi.length == of.length) return;

      const {_x, _y, width, height} = $("#linear-data-structure").viewBox.baseVal;
      let n = vertices.length;
      let y0 = height - 1.5 * VERTEX_RADIUS;
      let x0 = width / 2;

      // 1. gen x,y-posInitial with oi
      let dy = 2.5 * VERTEX_RADIUS;
      if (oi.length > Math.floor(height/dy)) {
        dy = (height - 2 * 1.5 * VERTEX_RADIUS) / (oi.length-1);
      }

      let xposi = {}, yposi = {};
      for (let i = 0; i < oi.length; i++) {
        xposi[oi[i]] = x0;
        yposi[oi[i]] = y0 - dy * i;
      }

      for (v of vertices) {
        if (xposi[v.id] || yposi[v.id]) continue;
        xposi[v.id] = x0;
        yposi[v.id] = - VERTEX_RADIUS * 2.5;
      }

      // 2. gen x,y-posFinal with of
      dy = 2.5 * VERTEX_RADIUS;
      if (of.length > Math.floor(height/dy)) {
        dy = (height - 2 * 1.5 * VERTEX_RADIUS) / (of.length-1);
      }

      let xposf = {}, yposf = {};
      for (let i = 0; i < of.length; i++) {
        xposf[of[i]] = x0;
        yposf[of[i]] = y0 - dy * i;
      }

      for (v of vertices) {
        if (xposf[v.id] || yposf[v.id]) continue;
        xposf[v.id] = x0;
        yposf[v.id] = - VERTEX_RADIUS * 2.5;
      }

      // 3. interpolate
      for (vertex of vertices) {
        let v = svgOLVertices[vertex.id];
        if (!v) return;

        let m = (yposf[v.id] - yposi[v.id])/100; // animation.progress.max = 100, presumably
        if (m == 0) continue;
        if (m < 0) m = (height + VERTEX_RADIUS * 2.5 - yposi[v.id])/100;
        let y = Math.min(Math.pow(animation.progress+1, 1.2), 100) * m + yposi[v.id];
        let x = x0;

        /* location changes */
        let body = getVertexBody(v);
        body.setAttributeNS(null, 'cx', x);
        body.setAttributeNS(null, 'cy', y);

        let label = getVertexLabel(v);
        label.setAttributeNS(null, 'x', x);
        label.setAttributeNS(null, 'y', y);
      }
    };

    animation.add({
        fill: targetObj.fill,
        stroke: targetObj.stroke,
        stroke_width: targetObj.stroke_width,
        update: function () {
          if (algo == "DFS") dfsUpdateFunction();
          else if (algo == "BFS") bfsUpdateFunction();
          else dijkstrasUpdateFunction();
        }
      });
  }

  return animation;
}

let generateEdgeAnime = (targetSvg, initialObj, targetObjs, dur) => {
  let animation = anime.timeline({
      targets: initialObj,
      loop: false,
      autoplay: false,
      easing: "easeOutQuad",
      duration: dur
    });

  for (let targetObj of targetObjs) {
    animation.add({
        stroke: targetObj.stroke,
        stroke_width: targetObj.stroke_width,
        arrow_base: targetObj.arrow_base,
        arrow_height: targetObj.arrow_height,
        update: function () {
          let body = getEdgeBody(targetSvg);
          let head = getEdgeHead(targetSvg);
          let tail = getEdgeTail(targetSvg);
          let edgeweight = getEdgeEdgeWeight(targetSvg);

          let b = initialObj.arrow_base;
          let h = initialObj.arrow_height;

          edgeweight.setAttributeNS(null, 'fill', initialObj.stroke);
          head.setAttributeNS(null, 'fill', initialObj.stroke);
          head.setAttributeNS(null, "points", "0,0 " + (-h)+","+(b/2) + " " + (-h)+","+(-b/2));
          if (tail) {
            tail.setAttributeNS(null, 'fill', initialObj.stroke);
            tail.setAttributeNS(null, "points", "0,0 " + (-h)+","+(b/2) + " " + (-h)+","+(-b/2));
          }
          body.setAttributeNS(null, 'stroke', initialObj.stroke);
          body.setAttributeNS(null, 'stroke-width', initialObj.stroke_width);
        }
      });
  }

  return animation;
}

// normal to red
let addVertexAnimation1 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_1(Di), [VERTEX_OBJ_2(Df), VERTEX_OBJ_3(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(Df), [VERTEX_OBJ_2(Di), VERTEX_OBJ_1(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// red to green
let addVertexAnimation2 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(Di), [VERTEX_OBJ_4(Df), VERTEX_OBJ_5(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_5(Df), [VERTEX_OBJ_4(Di), VERTEX_OBJ_3(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// red to red
let addVertexAnimation3 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(Di), [VERTEX_OBJ_2(Df), VERTEX_OBJ_3(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(Df), [VERTEX_OBJ_2(Di), VERTEX_OBJ_3(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// normal to green
let addVertexAnimation4 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_1(Di), [VERTEX_OBJ_4(Df), VERTEX_OBJ_5(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_5(Df), [VERTEX_OBJ_4(Di), VERTEX_OBJ_1(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// normal -> blue + no fill
let addVertexAnimation5 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_1(Di), [VERTEX_OBJ_6(Df), VERTEX_OBJ_7(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_7(Df), [VERTEX_OBJ_6(Di), VERTEX_OBJ_1(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// blue + no fill -> blue + fill
let addVertexAnimation6 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_7(Di), [VERTEX_OBJ_6(Df), VERTEX_OBJ_8(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_8(Df), [VERTEX_OBJ_6(Di), VERTEX_OBJ_7(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// normal -> red + fill
let addVertexAnimation7 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_1(Di), [VERTEX_OBJ_2(Df), VERTEX_OBJ_9(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_9(Df), [VERTEX_OBJ_2(Di), VERTEX_OBJ_1(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// blue + no fill -> blue + no fill (for when relaxing a relaxed vertex)
let addVertexAnimation8 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_7(Di), [VERTEX_OBJ_6(Df), VERTEX_OBJ_7(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_7(Df), [VERTEX_OBJ_6(Di), VERTEX_OBJ_7(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// normal -> blue + fill
let addVertexAnimation9 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_1(Di), [VERTEX_OBJ_6(Df), VERTEX_OBJ_8(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_8(Df), [VERTEX_OBJ_6(Di), VERTEX_OBJ_1(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// blue + fill -> blue + fill
let addVertexAnimation10 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_8(Di), [VERTEX_OBJ_6(Df), VERTEX_OBJ_8(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_8(Df), [VERTEX_OBJ_6(Di), VERTEX_OBJ_8(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// red + fill -> blue + fill
let addVertexAnimation11 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_9(Di), [VERTEX_OBJ_6(Df), VERTEX_OBJ_8(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_8(Df), [VERTEX_OBJ_6(Di), VERTEX_OBJ_9(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// red + fill -> red + fill
let addVertexAnimation12 = (targetSvg, dur, Di, Df, lines, oi, of, type) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_9(Di), [VERTEX_OBJ_2(Df), VERTEX_OBJ_9(Df)], dur, oi, of, type));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_9(Df), [VERTEX_OBJ_2(Di), VERTEX_OBJ_9(Di)], dur, of, oi, type));
  seqLine.push(lines);
}

// normal to red
let addEdgeAnimation1 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_2(), EDGE_OBJ_3()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_3(), [EDGE_OBJ_2(), EDGE_OBJ_1()], dur));
  seqLine.push(lines);
}

// normal to fade with red transition
let addEdgeAnimation2 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_2(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_2(), EDGE_OBJ_1()], dur));
  seqLine.push(lines);
}

// red to green
let addEdgeAnimation3 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_3(), [EDGE_OBJ_5(), EDGE_OBJ_6()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_6(), [EDGE_OBJ_5(), EDGE_OBJ_3()], dur));
  seqLine.push(lines);
}

// normal to green
let addEdgeAnimation4 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_5(), EDGE_OBJ_6()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_6(), [EDGE_OBJ_5(), EDGE_OBJ_1()], dur));
  seqLine.push(lines);
}

// normal to blue
let addEdgeAnimation5 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_7(), EDGE_OBJ_8()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_8(), [EDGE_OBJ_7(), EDGE_OBJ_1()], dur));
  seqLine.push(lines);
}

// normal to fade with blue transition
let addEdgeAnimation6 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_7(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_7(), EDGE_OBJ_1()], dur));
  seqLine.push(lines);
}

// fade to fade with blue transition
let addEdgeAnimation7 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_7(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_7(), EDGE_OBJ_4()], dur));
  seqLine.push(lines);
}

// fade to fade with red transition
let addEdgeAnimation8 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_2(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_2(), EDGE_OBJ_4()], dur));
  seqLine.push(lines);
}

// blue to fade with blue transition
let addEdgeAnimation9 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_8(), [EDGE_OBJ_7(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_7(), EDGE_OBJ_8()], dur));
  seqLine.push(lines);
}

// fade to blue with blue transition
let addEdgeAnimation10 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_7(), EDGE_OBJ_8()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_8(), [EDGE_OBJ_7(), EDGE_OBJ_4()], dur));
  seqLine.push(lines);
}

// blue to blue with blue transition
let addEdgeAnimation11 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_8(), [EDGE_OBJ_7(), EDGE_OBJ_8()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_8(), [EDGE_OBJ_7(), EDGE_OBJ_8()], dur));
  seqLine.push(lines);
}

// red to fade with red transition
let addEdgeAnimation12 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_3(), [EDGE_OBJ_2(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_2(), EDGE_OBJ_3()], dur));
  seqLine.push(lines);
}

// green to fade
let addEdgeAnimation13 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_6(), [EDGE_OBJ_5(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_5(), EDGE_OBJ_6()], dur));
  seqLine.push(lines);
}

// fade to red
let addEdgeAnimation14 = (targetSvg, dur, lines) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_2(), EDGE_OBJ_3()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_3(), [EDGE_OBJ_2(), EDGE_OBJ_4()], dur));
  seqLine.push(lines);
}

let DOUBLE_EDGE_OBJ_1 = () => { return { 
    stroke_width1: STROKE_WIDTH_1, stroke1: BLACK, arrow_base1: ARROW_BASE_1, arrow_height1: ARROW_HEIGHT_1,
    stroke_width2: STROKE_WIDTH_1, stroke2: BLUE,  arrow_base2: ARROW_BASE_1, arrow_height2: ARROW_HEIGHT_1
  };};

let DOUBLE_EDGE_OBJ_2 = () => { return { 
    stroke_width1: STROKE_WIDTH_2, stroke1: BLUE,  arrow_base1: ARROW_BASE_2, arrow_height1: ARROW_HEIGHT_2,
    stroke_width2: STROKE_WIDTH_2, stroke2: BLUE,  arrow_base2: ARROW_BASE_2, arrow_height2: ARROW_HEIGHT_2
  };};

let DOUBLE_EDGE_OBJ_3 = () => { return { 
    stroke_width1: STROKE_WIDTH_1, stroke1: BLUE,  arrow_base1: ARROW_BASE_1, arrow_height1: ARROW_HEIGHT_1,
    stroke_width2: STROKE_WIDTH_1, stroke2: FADE,  arrow_base2: ARROW_BASE_1, arrow_height2: ARROW_HEIGHT_1
  };};

let DOUBLE_EDGE_OBJ_4 = () => { return { 
    stroke_width1: STROKE_WIDTH_1, stroke1: FADE,  arrow_base1: ARROW_BASE_1, arrow_height1: ARROW_HEIGHT_1,
    stroke_width2: STROKE_WIDTH_1, stroke2: BLUE,  arrow_base2: ARROW_BASE_1, arrow_height2: ARROW_HEIGHT_1
  };};

let generateDoubleEdgeAnime = (targetSvg1, targetSvg2, initialObj, doubleTargetObjs, dur) => {
  let animation = anime.timeline({
      targets: initialObj,
      loop: false,
      autoplay: false,
      easing: "easeOutQuad",
      duration: dur
    });

  for (let targetObj of doubleTargetObjs) {
    animation.add({
        stroke1: targetObj.stroke1,
        stroke_width1: targetObj.stroke_width1,
        arrow_base1: targetObj.arrow_base1,
        arrow_height1: targetObj.arrow_height1,
        stroke2: targetObj.stroke2,
        stroke_width2: targetObj.stroke_width2,
        arrow_base2: targetObj.arrow_base2,
        arrow_height2: targetObj.arrow_height2,
        update: function () {
          let body1 = getEdgeBody(targetSvg1);
          let head1 = getEdgeHead(targetSvg1);
          let tail1 = getEdgeTail(targetSvg1);
          let edgeweight1 = getEdgeEdgeWeight(targetSvg1);

          let b1 = initialObj.arrow_base1;
          let h1 = initialObj.arrow_height1;

          edgeweight1.setAttributeNS(null, 'fill', initialObj.stroke1);
          head1.setAttributeNS(null, 'fill', initialObj.stroke1);
          head1.setAttributeNS(null, "points", "0,0 " + (-h1)+","+(b1/2) + " " + (-h1)+","+(-b1/2));
          if (tail1) {
            tail1.setAttributeNS(null, 'fill', initialObj.stroke1);
            tail1.setAttributeNS(null, "points", "0,0 " + (-h1)+","+(b1/2) + " " + (-h1)+","+(-b1/2));
          }
          body1.setAttributeNS(null, 'stroke', initialObj.stroke1);
          body1.setAttributeNS(null, 'stroke-width', initialObj.stroke_width1);

          let body2 = getEdgeBody(targetSvg2);
          let head2 = getEdgeHead(targetSvg2);
          let tail2 = getEdgeTail(targetSvg2);
          let edgeweight2 = getEdgeEdgeWeight(targetSvg2);

          let b2 = initialObj.arrow_base2;
          let h2 = initialObj.arrow_height2;

          edgeweight2.setAttributeNS(null, 'fill', initialObj.stroke2);
          head2.setAttributeNS(null, 'fill', initialObj.stroke2);
          head2.setAttributeNS(null, "points", "0,0 " + (-h2)+","+(b2/2) + " " + (-h2)+","+(-b2/2));
          if (tail2) {
            tail2.setAttributeNS(null, 'fill', initialObj.stroke2);
            tail2.setAttributeNS(null, "points", "0,0 " + (-h2)+","+(b2/2) + " " + (-h2)+","+(-b2/2));
          }
          body2.setAttributeNS(null, 'stroke', initialObj.stroke2);
          body2.setAttributeNS(null, 'stroke-width', initialObj.stroke_width2);
        }
      });
  }

  return animation;
}

// targetSvg1, normal to blue
// targetSvg2, blue to fade with blue transition
let addDoubleEdgeAnimation1 = (targetSvg1, targetSvg2, dur, lines) => {
  seqForward.push(generateDoubleEdgeAnime(targetSvg1, targetSvg2, DOUBLE_EDGE_OBJ_1(), [DOUBLE_EDGE_OBJ_2(), DOUBLE_EDGE_OBJ_3()], dur));
  seqReverse.push(generateDoubleEdgeAnime(targetSvg1, targetSvg2, DOUBLE_EDGE_OBJ_3(), [DOUBLE_EDGE_OBJ_2(), DOUBLE_EDGE_OBJ_1()], dur));
  seqLine.push(lines);
};

// targetSvg1, fade to blue
// targetSvg2, blue to fade with blue transition
let addDoubleEdgeAnimation2 = (targetSvg1, targetSvg2, dur, lines) => {
  seqForward.push(generateDoubleEdgeAnime(targetSvg1, targetSvg2, DOUBLE_EDGE_OBJ_4(), [DOUBLE_EDGE_OBJ_2(), DOUBLE_EDGE_OBJ_3()], dur));
  seqReverse.push(generateDoubleEdgeAnime(targetSvg1, targetSvg2, DOUBLE_EDGE_OBJ_3(), [DOUBLE_EDGE_OBJ_2(), DOUBLE_EDGE_OBJ_4()], dur));
  seqLine.push(lines);
};

let generateDummyAnime = (dur) => {
  let animation = anime.timeline({
      loop: false,
      autoplay: false,
      easing: "easeOutQuad",
      duration: dur
    });

  return animation;
}

let addDummyAnimation = (dur, lines) => {
  seqForward.push(generateDummyAnime(dur));
  seqReverse.push(generateDummyAnime(dur));
  seqLine.push(lines);
}

/* this is key to prevent animating deleted objects */
let pauseAllAnimations = () => {
  for (animation of seqForward) {
    if (!animation) continue;
    animation.pause();
  }
  for (animation of seqReverse) {
    if (!animation) continue;
    animation.pause();
  }
};

let resetAnimations = () => {
  pauseAllAnimations();
  progress.value = 0;
  progress.max = 0;
  isPlaying = false;
  seqIndex = 0;
  seqForward = [];
  seqReverse = [];
  seqLine = [];
  pause();
  setButtonOpacities();
  ldsInActive();
}

let setButtonOpacities = () => {
  let Fb = $('#forward');
  let Bb = $('#reverse');
  let Sb = $('#jump-to-start');
  let Eb = $('#jump-to-end');
  let Pb = $('#play-pause');

  Fb.style.opacity = isPlaying || !seqForward.length ? "0.4" : "1.0";
  Bb.style.opacity = isPlaying || !seqForward.length ? "0.4" : "1.0";
  Sb.style.opacity = isPlaying || !seqForward.length ? "0.4" : "1.0";
  Eb.style.opacity = isPlaying || !seqForward.length ? "0.4" : "1.0";
  Pb.style.opacity = !seqForward.length ? "0.4" : "1.0";
  progress.style.opacity = isPlaying || !seqForward.length ? "0.7" : "1.0";
};

let isPlaying = false;
let play_pause = () => {
  if (seqForward.length == 0) return;
  let playPauseButton = $('#play-pause');
  if (isPlaying) {
    pause();
    playPauseButton.innerHTML = "<i class=\"material-icons\">play_arrow</i>";
  } else {
    play();
    playPauseButton.innerHTML = "<i class=\"material-icons\">pause</i>";
  }
  isPlaying = !isPlaying;
  setButtonOpacities();
};

let seqIndex = 0;
let player = null;
let seqForward = [];
let seqReverse = [];
let seqLine = [];
let clickInterval = 600;

let play = () => {
  player = setInterval(function(){
    forward();
  }, clickInterval);
  progress.style.pointerEvents = "none";
}

let pause = () => {
  if (!player) return;
  clearInterval(player);
  player = null;
  progress.style.pointerEvents = "auto";
}

let reverse = () => {
  if (seqIndex == 0) return;
  progress.value--;
  seqReverse[seqIndex].play();
  seqIndex--;
  highlightLines(seqIndex == 0 ? [] : seqLine[seqIndex]);
};

let forward = () => {
  if (seqIndex == seqForward.length-1) return;
  progress.value++;
  seqForward[seqIndex].play();
  highlightLines(seqLine[seqIndex]);
  seqIndex++;
};

let seek = (index) => {
  if (seqForward.length == 0) return;
  seqIndex = index;
  highlightLines(seqIndex == 0 ? [] : seqLine[seqIndex-1]);

  for (let i = 0; i < index; i++) {
    if (seqForward[i]) {
      seqForward[i].seek(0);
      seqForward[i].seek(100);
    }
  }
  for (let i = 1; i < index+1; i++) {
    if (seqReverse[i]) {
      seqReverse[i].seek(100);
      seqReverse[i].seek(0);
    }
  }

  for (let i = seqForward.length-2; i > index; i--) {
    if (seqReverse[i]) {
      seqReverse[i].seek(0);
      seqReverse[i].seek(100);
    }
  }
  for (let i = seqForward.length-1; i >= index; i--) {
    if (seqForward[i]) {
      seqForward[i].seek(100);
      seqForward[i].seek(0);
    }
  }
};

let jumpToStart = () => {
  if (player) return;
  progress.value = progress.min;
  seek(progress.value);
};

let jumpToEnd = () => {
  if (player) return;
  progress.value = progress.max;
  seek(progress.value);
};

progress.addEventListener('input', function() {
  seek(progress.value);
});

let reverseButton = () => {
  if (player) return;
  reverse();
};

let forwardButton = () => {
  if (player) return;
  forward();
};

let highlightLines = (lines) => {
  if (!lines) return;
  let codes = document.getElementsByClassName("code");
  for (let code of codes) {
    code.classList.remove("active-line");
    code.classList.remove("active-line-red");
  }
  for (let line of lines) {
    let isRedLine = line < 0;
    if (isRedLine) $(".line-"+(-line)).classList.add("active-line-red");
    else $(".line-"+line).classList.add("active-line");
  }
};

let ldsActive = (ldsType) => {
  let title = $("#lds-title");
  let lds = $("#linear-data-structure");  
  title.innerHTML = ldsType;
  title.classList.remove("inactive");
  lds.classList.remove("inactive");
};

let ldsInActive = () => {
  let title = $("#lds-title");
  title.innerHTML = "Data Structure";

  title.classList.add("inactive");
  $("#linear-data-structure").classList.add("inactive");
};

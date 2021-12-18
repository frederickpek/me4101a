let BLACK = '#000000';
let BLUE = '#26428b';
let GREEN = '#0f9d57';
let RED = '#db4437';
let WHITE = '#f0f0f0';
let FADE = '#e6e6e6';

let STROKE_WIDTH_1 = 1.5;
let STROKE_WIDTH_2 = 4;

let progress = document.querySelector('.progress');

let VERTEX_OBJ_1 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: BLACK, fill: WHITE }; };
let VERTEX_OBJ_2 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: RED, fill: RED }; };
let VERTEX_OBJ_3 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: RED, fill: WHITE }; };
let VERTEX_OBJ_4 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: GREEN, fill: GREEN }; };
let VERTEX_OBJ_5 = () => { return { stroke_width: STROKE_WIDTH_1+0.5, stroke: GREEN, fill: WHITE }; };

let EDGE_OBJ_1 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: BLACK }; };
let EDGE_OBJ_2 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: RED }; };
let EDGE_OBJ_3 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: RED }; };
let EDGE_OBJ_4 = () => { return { stroke_width: STROKE_WIDTH_1, stroke: FADE }; };
let EDGE_OBJ_5 = () => { return { stroke_width: STROKE_WIDTH_2, stroke: GREEN }; };
let EDGE_OBJ_6 = () => { return { stroke_width: STROKE_WIDTH_1+0.5, stroke: GREEN }; };

let generateVertexAnime = (targetSvg, initialObj, targetObjs, dur) => {
  let animation = anime.timeline({
      targets: initialObj,
      loop: false,
      autoplay: false,
      easing: "easeOutQuad",
      duration: dur
    });

  for (let targetObj of targetObjs) {
    animation.add({
        fill: targetObj.fill,
        stroke: targetObj.stroke,
        stroke_width: targetObj.stroke_width,
        update: function () {
          targetSvg.setAttributeNS(null, 'fill', initialObj.fill);
          targetSvg.setAttributeNS(null, 'stroke', initialObj.stroke);
          targetSvg.setAttributeNS(null, 'stroke-width', initialObj.stroke_width);
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
        update: function () {
          let body = getEdgeBody(targetSvg);
          let head = getEdgeHead(targetSvg);
          let tail = getEdgeTail(targetSvg);
          head.setAttributeNS(null, 'fill', initialObj.stroke);
          tail.setAttributeNS(null, 'fill', initialObj.stroke);
          body.setAttributeNS(null, 'stroke', initialObj.stroke);
          body.setAttributeNS(null, 'stroke-width', initialObj.stroke_width);
        }
      });
  }

  return animation;
}

// normal to red
let addVertexAnimation1 = (targetSvg, dur) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_1(), [VERTEX_OBJ_2(), VERTEX_OBJ_3()], dur));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(), [VERTEX_OBJ_2(), VERTEX_OBJ_1()], dur));
}

// red to green
let addVertexAnimation2 = (targetSvg, dur) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(), [VERTEX_OBJ_4(), VERTEX_OBJ_5()], dur));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_5(), [VERTEX_OBJ_4(), VERTEX_OBJ_3()], dur));
}

// red to red
let addVertexAnimation3 = (targetSvg, dur) => {
  seqForward.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(), [VERTEX_OBJ_2(), VERTEX_OBJ_3()], dur));
  seqReverse.push(generateVertexAnime(targetSvg, VERTEX_OBJ_3(), [VERTEX_OBJ_2(), VERTEX_OBJ_3()], dur));
}

// normal to red
let addEdgeAnimation1 = (targetSvg, dur) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_2(), EDGE_OBJ_3()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_3(), [EDGE_OBJ_2(), EDGE_OBJ_1()], dur));
}

// normal to fade
let addEdgeAnimation2 = (targetSvg, dur) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_2(), EDGE_OBJ_4()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_4(), [EDGE_OBJ_2(), EDGE_OBJ_1()], dur));
}

// red to green
let addEdgeAnimation3 = (targetSvg, dur) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_3(), [EDGE_OBJ_5(), EDGE_OBJ_6()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_6(), [EDGE_OBJ_5(), EDGE_OBJ_3()], dur));
}

// normal to green
let addEdgeAnimation4 = (targetSvg, dur) => {
  seqForward.push(generateEdgeAnime(targetSvg, EDGE_OBJ_1(), [EDGE_OBJ_5(), EDGE_OBJ_6()], dur));
  seqReverse.push(generateEdgeAnime(targetSvg, EDGE_OBJ_6(), [EDGE_OBJ_5(), EDGE_OBJ_1()], dur));
}

let resetAnimations = () => {
  progress.value = 0;
  progress.max = 0;
  isPlaying = false;
  seqIndex = 0;
  seqForward = [];
  seqReverse = [];
  pause();
  setButtonOpacities();
}

let setButtonOpacities = () => {
  let Fb = document.querySelector('.forward');
  let Bb = document.querySelector('.reverse');
  let Sb = document.querySelector('.jump-to-start');
  let Eb = document.querySelector('.jump-to-end');
  let Pb = document.querySelector('.play-pause');

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
  let playPauseButton = document.querySelector('.play-pause');
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
};

let forward = () => {
  if (seqIndex == seqForward.length-1) return;
  progress.value++;
  seqForward[seqIndex].play();
  seqIndex++;
};

let seek = (index) => {
  if (seqForward.length == 0) return;
  seqIndex = index;

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

let marginVal = 1;
let posix = 1;
let posiy = 1;

document.body.addEventListener('keydown',
    event => {
        if (event.key === ' ' ) {
        //コンソールに表示
          console.log("space")
          marginVal += 0.1;
        }
    });

    document.body.addEventListener('keydown',
    event => {
        if (event.key === 'x' ) {
        //コンソールに表示
          console.log("x")
          x += 0.1;
        }
    });

    document.body.addEventListener('keydown',
    event => {
        if (event.key === 'y' ) {
        //コンソールに表示
          console.log("y")
          posiy += 0.1;
        }
    });

    document.querySelector('#size').addEventListener('input', (event) => {
      console.log(Number(event.target.value));
      marginVal = Number(event.target.value);
    });

    document.querySelector('#x').addEventListener('input', (event) => {
      console.log(Number(event.target.value));
      posix = Number(event.target.value);
    });

    document.querySelector('#y').addEventListener('input', (event) => {
      console.log(Number(event.target.value));
      posiy = Number(event.target.value);
    });

    document.querySelector('#frame').addEventListener('input', (event) => {
      switch (event.target.value) {
        case 'フレームなし':
          document.getElementById('natural').style.opacity = 0;
          document.getElementById('live').style.opacity = 0;
          break;
        case 'ナチュラル':
          document.getElementById('natural').style.opacity = 1;
          document.getElementById('live').style.opacity = 0;
          break;
        case 'ライブ':
          document.getElementById('natural').style.opacity = 0;
          document.getElementById('live').style.opacity = 1;
          break;
      }
      console.log(event.target.value);
    });

    window.addEventListener('resize', () => {
      const screenAspect = window.innerHeight / window.innerWidth;
      const imgAspect = 800 / 1200;

      if (screenAspect < imgAspect) {
        document.getElementById('live').style.width = `${ window.innerHeight / imgAspect }px`;
        document.getElementById('live').style.height = '100%';
      } else {
        document.getElementById('live').style.width = '100%';
        document.getElementById('live').style.height = `${ window.innerWidth * imgAspect }px`;

        document.getElementById('keyframes').innerText = `
          @keyframes comments {
            0% {
              background-position: 0 0;
            }
    
            100% {
              background-position: 0 -${ document.getElementById('live').clientHeight * 0.305 }px;
            }
          }
        `;
      }
    });

    window.dispatchEvent(new Event('resize'));
const startVideo = async video => {
  try {
    const constraints = { audio: false, video: {} };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (error) {
    console.error(error);
  }
};

const loadModels = async () => {
    await Promise.all([
     faceapi.nets.tinyFaceDetector.loadFromUri(`/js/lib/models`),
     faceapi.nets.faceExpressionNet.loadFromUri(`/js/lib/models`)
   ]);
  };

(async () => {
  const video = document.querySelector("video");
  // 画像セットアップ
  const image = new Image();
  image.src = `/images/cage_neutral.png`;
  await loadModels();
  await startVideo(video);

  video.addEventListener("play", () => {
    // overlay canvas作成
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const tinyFaceDetectorOption = {
      // default 416
      inputSize: 224,
      // default 0.5
      scoreThreshold: 0.5
    };

    setInterval(async () => { 
      const results = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions(tinyFaceDetectorOption)
      ).withFaceExpressions();
      if (results.length <= 0) return;
      // 検出結果をcanvasのサイズにリサイズ
      const resizedResults = faceapi.resizeResults(results, displaySize);

      // canvasの内容をクリア
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      // 矩形描画
      //faceapi.draw.drawDetections(canvas, resizedResults);

       resizedResults.forEach(({ detection, expressions }) => {
        //console.log(expressions.sad);
        if (document.querySelector('#emotion').checked) {
          if (.4 < expressions.happy) {
            document.getElementById('happy').style.opacity = 1;
            document.getElementById('sad').style.opacity = 0;
            document.getElementById('angry').style.opacity = 0;
          } else if (.4 < expressions.sad) {
            document.getElementById('happy').style.opacity = 0;
            document.getElementById('sad').style.opacity = 1;
            document.getElementById('angry').style.opacity = 0;
          } else if (.4 < expressions.angry) {
            document.getElementById('happy').style.opacity = 0;
            document.getElementById('sad').style.opacity = 0;
            document.getElementById('angry').style.opacity = 1;
          } else {
            document.getElementById('happy').style.opacity = 0;
            document.getElementById('sad').style.opacity = 0;
            document.getElementById('angry').style.opacity = 0;
          }
        }

              // 矩形の情報はdetection.boxに格納されている
              const width = image.width * marginVal;
              const height = image.height * marginVal;
              const x = detection.box.x *posix - (width - detection.box._width) /2;
              const y = detection.box.y * posiy - (height - detection.box._height) / 2;

              //canvas.getContext("2d").fillRect(x, y, width, height); // 追加
              canvas.getContext("2d").drawImage(image, x, y, width, height);
            });

    }, 100);


  });


})();
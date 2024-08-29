let scene, camera, renderer, model, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    loadModel();

    window.addEventListener('resize', onWindowResize, false);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/our-model.glb',
        (gltf) => {
            model = gltf.scene;
            scene.add(model);

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            camera.position.z = cameraZ * 1.5;
            
            const minZ = box.min.z;
            const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

            camera.far = cameraToFarEdge * 3;
            camera.updateProjectionMatrix();

            controls.maxDistance = cameraToFarEdge * 2;
            controls.target.set(0, 0, 0);
            controls.update();

            // 隐藏加载消息
            hideLoadingMessage();
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            // 如果需要，这里可以更新加载进度条
        },
        (error) => {
            console.error('An error happened', error);
            handleLoadError();
        }
    );
}

function handleLoadError() {
    // 显示错误消息
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.position = 'absolute';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.color = 'red';
    errorMessage.style.fontSize = '20px';
    errorMessage.style.textAlign = 'center';
    errorMessage.innerHTML = '模型加载失败。<br>请检查网络连接或刷新页面重试。';
    document.body.appendChild(errorMessage);

    // 隐藏加载消息
    hideLoadingMessage();

    // 这里可以添加其他错误处理逻辑
    // 例如，尝试加载备用模型或显示默认几何体
    // loadFallbackModel();
}

function showLoadingMessage() {
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.style.position = 'absolute';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.color = 'black';
    loadingMessage.style.fontSize = '20px';
    loadingMessage.innerHTML = '正在加载模型...';
    document.body.appendChild(loadingMessage);
}

function hideLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

showLoadingMessage(); // 显示加载消息
init();
animate();
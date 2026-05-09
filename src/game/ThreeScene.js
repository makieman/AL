import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class ThreeScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = null;
    this.clock = new THREE.Clock();

    this.playerObject = null;
    this.planetObject = null;
  }

  init() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x101020);
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 10, 20);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    this.scene.add(directionalLight);

    this.addStars();

    this.createPlanet();
    this.createPlayer();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 100;
    this.controls.target.set(0, 0, 0);

    window.addEventListener("resize", () => this.onWindowResize());

    this.animate();
  }

  addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      sizeAttenuation: true,
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(200);
      const y = THREE.MathUtils.randFloatSpread(200);
      const z = THREE.MathUtils.randFloatSpread(200);
      if (Math.sqrt(x * x + y * y + z * z) > 20) {
        starsVertices.push(x, y, z);
      } else {
        i--;
      }
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  createPlanet() {
    const planetGeometry = new THREE.SphereGeometry(4, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a6f8a,
      shininess: 10,
    });
    this.planetObject = new THREE.Mesh(planetGeometry, planetMaterial);
    this.scene.add(this.planetObject);
  }

  createPlayer() {
    const playerGroup = new THREE.Group();

    const bodyGeometry = new THREE.ConeGeometry(0.8, 2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xe88a5b,
      shininess: 30,
    });
    const playerBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    playerBody.rotation.x = Math.PI / 2;
    playerGroup.add(playerBody);

    const cockpitGeometry = new THREE.SphereGeometry(
      0.4,
      16,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const cockpitMaterial = new THREE.MeshPhongMaterial({
      color: 0xadd8e6,
      transparent: true,
      opacity: 0.6,
      shininess: 50,
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.rotation.x = Math.PI;
    cockpit.position.set(0, 0, -0.6);
    playerBody.add(cockpit);

    this.playerObject = playerGroup;
    this.playerObject.position.set(0, 0, 10);
    this.scene.add(this.playerObject);
  }

  onWindowResize() {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.planetObject) {
      this.planetObject.rotation.y += 0.2 * delta;
    }

    if (this.playerObject) {
      const orbitRadius = 10;
      const orbitSpeed = 0.5;
      this.playerObject.position.x =
        Math.cos(elapsedTime * orbitSpeed) * orbitRadius;
      this.playerObject.position.z =
        Math.sin(elapsedTime * orbitSpeed) * orbitRadius;
      this.playerObject.lookAt(this.planetObject.position);
      this.playerObject.rotateY(Math.PI);
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

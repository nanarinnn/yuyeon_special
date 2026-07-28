import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera, RotateCcw, Eye } from 'lucide-react';
import { MINIROOM_IMAGES } from '../data/miniroomImages';

export const MiniroomView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<'default' | 'top' | 'front'>('default');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- Helper: Generate sleek Gray Placeholder Texture on HTML Canvas ---
    function createGrayTexture(label: string, width = 512, height = 512, bgColor = '#27272a', textColor = '#c084fc') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, width - 24, height - 24);

        ctx.fillStyle = textColor;
        ctx.font = `bold ${Math.floor(width / 13)}px Paperlogy, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, width / 2, height / 2);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    // Load Texture helper
    const textureLoader = new THREE.TextureLoader();
    function getTexture(imageUrl: string, fallbackLabel: string, width = 512, height = 512, bgColor = '#27272a') {
      if (!imageUrl || imageUrl === 'image') {
        return createGrayTexture(`${fallbackLabel}`, width, height, bgColor);
      }
      try {
        const tex = textureLoader.load(imageUrl, undefined, undefined, () => {
          console.warn(`Failed to load texture ${imageUrl}, using fallback.`);
        });
        return tex;
      } catch {
        return createGrayTexture(`${fallbackLabel}`, width, height, bgColor);
      }
    }

    // 🎨 Color Config - 한 톤 다운된 딥 퍼플 모던 카페 톤
    const CONFIG = {
      wallColor: '#a79ab8',        // 밝은 인디고 퍼플 -> 중후한 퍼플 그레이
      floorColor: '#8c7d9e',       // 바닥도 차분하고 깊게 다운
      counterColor: '#362247',     // 딥 다크 퍼플 카운터
      counterTopColor: '#21132e',  // 카운터 상판 차분한 블랙 퍼플
      tableColor: '#d4c9de',       // 테이블 쨍한 흰색에서 연회색 퍼플로 다운
      chairColor: '#8a5c8a',       // 의자 차분한 다크 로즈 퍼플
      cupHolderColor: '#7e22ce',   // 컵홀더 뚜껑 톤다운 퍼플
    };

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#09060f'); // 배경도 더 깊은 다크톤으로

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 17);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85; // 노출값 다운으로 빛날림 방지

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // 5. Materials
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.floorColor,
      roughness: 0.8,
    });
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.wallColor,
      roughness: 0.9,
    });
    const counterMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.counterColor,
      roughness: 0.6,
      metalness: 0.1,
    });
    const counterTopMat = new THREE.MeshStandardMaterial({
      color: CONFIG.counterTopColor,
      roughness: 0.4,
    });
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.tableColor,
      roughness: 0.5,
    });
    const chairMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.chairColor,
      roughness: 0.5,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x71717a,
      metalness: 0.9,
      roughness: 0.2,
    });

    const cupBodyMaterial = new THREE.MeshStandardMaterial({
      map: getTexture(MINIROOM_IMAGES.cupHolder, 'CUP', 256, 256, '#27272a'),
      roughness: 0.4,
    });
    const cupCapMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.cupHolderColor,
      roughness: 0.4,
    });

    // Banners & Frames
    const bannerMaterial = new THREE.MeshBasicMaterial({
      map: getTexture(MINIROOM_IMAGES.mainBanner, 'MAIN BANNER', 1024, 512, '#27272a'),
    });
    const frameMaterial = new THREE.MeshBasicMaterial({
      map: getTexture(MINIROOM_IMAGES.verticalFrame, 'FRAME (VERTICAL)', 512, 768, '#27272a'),
    });
    const horizontalFrameMaterial = new THREE.MeshBasicMaterial({
      map: getTexture(MINIROOM_IMAGES.horizontalFrame, 'FRAME (HORIZONTAL)', 768, 512, '#27272a'),
    });
    const standingBannerMaterial = new THREE.MeshBasicMaterial({
      map: getTexture(MINIROOM_IMAGES.standingBanner, 'STAND BANNER', 512, 1024, '#27272a'),
    });
    const counterBannerMat = new THREE.MeshBasicMaterial({
      map: getTexture(MINIROOM_IMAGES.counterPlancard, 'COUNTER PLANCARD', 1024, 256, '#18181b'),
    });

    // ⭐️ 아크릴 스탠드용 투명 재질 수정 (DoubleSide 적용)
    const acrylicTexture = getTexture(MINIROOM_IMAGES.acrylicProp, 'ACRYLIC PROP', 256, 384, '#27272a');
    const tablePropMat = new THREE.MeshStandardMaterial({
      map: acrylicTexture,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide, // 양면 모두 보이게 설정
    });

    const signboardMat = new THREE.MeshBasicMaterial({
      map: getTexture(MINIROOM_IMAGES.signboard, 'SIGNBOARD', 512, 768, '#27272a'),
    });

    // 6. Lighting - 전체적인 빛 강도를 낮추고 은은하게 변경
    const ambientLight = new THREE.AmbientLight('#c4b5fd', 0.45); // 밝기 축소
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 0.7); // 1.0 -> 0.7 조명 강도 다운
    mainLight.position.set(5, 18, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const pointLight = new THREE.PointLight('#a855f7', 0.9, 12);
    pointLight.position.set(-3.5, 3.5, -2);
    scene.add(pointLight);

    // 7. Room Structure
    const floorGeo = new THREE.BoxGeometry(14, 0.2, 14);
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallBackGeo = new THREE.BoxGeometry(14, 7, 0.2);
    const wallBack = new THREE.Mesh(wallBackGeo, wallMaterial);
    wallBack.position.set(0, 3.5, -7);
    wallBack.receiveShadow = true;
    scene.add(wallBack);

    const wallLeftGeo = new THREE.BoxGeometry(0.2, 7, 14);
    const wallLeft = new THREE.Mesh(wallLeftGeo, wallMaterial);
    wallLeft.position.set(-7, 3.5, 0);
    wallLeft.receiveShadow = true;
    scene.add(wallLeft);

    // 8. Main Banner
    const bannerFrameMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
    });

    const bannerGeo = new THREE.PlaneGeometry(7.0, 2.8);
    const banner = new THREE.Mesh(bannerGeo, bannerMaterial);
    banner.position.set(0.0, 4.2, -6.85);
    scene.add(banner);

    const bannerFrameGeo = new THREE.BoxGeometry(7.2, 3.0, 0.05);
    const bannerFrame = new THREE.Mesh(bannerFrameGeo, bannerFrameMat);
    bannerFrame.position.set(0, 4.2, -6.89);
    scene.add(bannerFrame);

    // 9. Vertical Frame on Left Wall
    const frameGeo = new THREE.PlaneGeometry(2.4, 3.4);
    const frame = new THREE.Mesh(frameGeo, frameMaterial);
    frame.rotation.y = Math.PI / 2;
    frame.position.set(-6.85, 3.5, -4.2);
    scene.add(frame);

    const frameBorderGeo = new THREE.BoxGeometry(0.05, 3.6, 2.6);
    const frameBorder = new THREE.Mesh(frameBorderGeo, bannerFrameMat);
    frameBorder.position.set(-6.89, 3.5, -4.2);
    scene.add(frameBorder);

    // 10. Horizontal Frame on Left Wall
    const horizontalFrameGeo = new THREE.PlaneGeometry(4.2, 3.0);
    const horizontalFrame = new THREE.Mesh(horizontalFrameGeo, horizontalFrameMaterial);
    horizontalFrame.rotation.y = Math.PI / 2;
    horizontalFrame.position.set(-6.85, 3.5, -0.3);
    scene.add(horizontalFrame);

    const horizontalBorderGeo = new THREE.BoxGeometry(0.05, 3.2, 4.4);
    const horizontalBorder = new THREE.Mesh(horizontalBorderGeo, bannerFrameMat);
    horizontalBorder.position.set(-6.89, 3.5, -0.3);
    scene.add(horizontalBorder);

    // 11. Photo Gallery Grid on Left Wall
    const photoGroup = new THREE.Group();
    photoGroup.position.set(-6.85, 3.5, 4);
    photoGroup.rotation.y = Math.PI / 2;
    scene.add(photoGroup);

    const galleryRowHeight = 1.0;
    const galleryGap = 0.2;

    const createPhotoRow = (photoIndices: number[], yPos: number) => {
      let startX = -((1.2 * photoIndices.length) + (galleryGap * (photoIndices.length - 1))) / 2;
      photoIndices.forEach((idx) => {
        const imgUrl = MINIROOM_IMAGES.photoGallery[idx] || 'image';
        const tex = getTexture(imgUrl, `PHOTO #${idx + 1}`, 256, 256, '#27272a');
        const geo = new THREE.PlaneGeometry(1.2, galleryRowHeight);
        const mat = new THREE.MeshBasicMaterial({ map: tex });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(startX + 0.6, yPos, 0.01);
        photoGroup.add(mesh);
        startX += 1.2 + galleryGap;
      });
    };

    createPhotoRow([0, 1], 1.1);
    createPhotoRow([2, 3], 0.0);
    createPhotoRow([4, 5], -1.1);

    // 12. Coffee Machine
    const coffeeMachineGroup = new THREE.Group();
    coffeeMachineGroup.position.set(3.0, 2.275, -4.2);

    const bodyGeo = new THREE.BoxGeometry(1.2, 1.4, 1.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    coffeeMachineGroup.add(body);

    const hopperGeo = new THREE.BoxGeometry(0.8, 0.4, 0.7);
    const hopperMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    const hopper = new THREE.Mesh(hopperGeo, hopperMat);
    hopper.position.set(0, 1.6, 0);
    hopper.castShadow = true;
    coffeeMachineGroup.add(hopper);

    const groupHeadGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
    const groupHead = new THREE.Mesh(groupHeadGeo, metalMat);
    groupHead.position.set(0, 0.6, 0.35);
    coffeeMachineGroup.add(groupHead);

    const trayGeo = new THREE.BoxGeometry(1.2, 0.1, 1.1);
    const tray = new THREE.Mesh(trayGeo, metalMat);
    tray.position.set(0, 0.05, 0.05);
    coffeeMachineGroup.add(tray);
    scene.add(coffeeMachineGroup);

    // 13. Counter Structure
    const counterGroup = new THREE.Group();
    const counterMainGeo = new THREE.BoxGeometry(6.0, 2.2, 2.2);
    const counterMain = new THREE.Mesh(counterMainGeo, counterMaterial);
    counterMain.position.set(-1.2, 1.1, -1.5);
    counterMain.castShadow = true;
    counterMain.receiveShadow = true;
    counterGroup.add(counterMain);

    const counterMainTopGeo = new THREE.BoxGeometry(6.1, 0.15, 2.3);
    const counterMainTop = new THREE.Mesh(counterMainTopGeo, counterTopMat);
    counterMainTop.position.set(-1.2, 2.2, -1.5);
    counterMainTop.castShadow = true;
    counterGroup.add(counterMainTop);

    const counterSideGeo = new THREE.BoxGeometry(2.4, 2.2, 5.0);
    const counterSide = new THREE.Mesh(counterSideGeo, counterMaterial);
    counterSide.position.set(3.0, 1.1, -2.9);
    counterSide.castShadow = true;
    counterSide.receiveShadow = true;
    counterGroup.add(counterSide);

    const counterSideTopGeo = new THREE.BoxGeometry(2.5, 0.15, 5.1);
    const counterSideTop = new THREE.Mesh(counterSideTopGeo, counterTopMat);
    counterSideTop.position.set(3.0, 2.2, -2.9);
    counterSideTop.castShadow = true;
    counterGroup.add(counterSideTop);
    scene.add(counterGroup);

    // Counter Plancard
    const counterBannerGeo = new THREE.PlaneGeometry(8.4, 2.0);
    const counterBanner = new THREE.Mesh(counterBannerGeo, counterBannerMat);
    counterBanner.position.set(0, 1.1, -0.39);
    scene.add(counterBanner);

    // 14. Signboard
    const signboardGroup = new THREE.Group();
    signboardGroup.position.set(2.5, 0, 1.5);
    signboardGroup.rotation.y = -Math.PI / 6;

    const signGeo = new THREE.PlaneGeometry(1.2, 1.8);
    const signFront = new THREE.Mesh(signGeo, signboardMat);
    signFront.position.set(0, 0.9, 0.2);
    signFront.rotation.x = -0.15;
    signboardGroup.add(signFront);

    const signBack = new THREE.Mesh(signGeo, wallMaterial);
    signBack.position.set(0, 0.9, -0.2);
    signBack.rotation.x = 0.15;
    signBack.rotation.y = Math.PI;
    signboardGroup.add(signBack);
    scene.add(signboardGroup);

    // 15. Cup Holder Pyramid
    const cupHolderGeo = new THREE.CylinderGeometry(0.25, 0.18, 0.5, 16);
    const cupMaterials = [cupBodyMaterial, cupCapMaterial, cupCapMaterial];
    const pyramidPositions = [
      { x: -2.8, y: 2.525, z: -1.8 }, { x: -2.3, y: 2.525, z: -1.8 }, { x: -1.8, y: 2.525, z: -1.8 },
      { x: -2.8, y: 2.525, z: -1.5 }, { x: -2.3, y: 2.525, z: -1.5 }, { x: -1.8, y: 2.525, z: -1.5 },
      { x: -2.8, y: 2.525, z: -1.2 }, { x: -2.3, y: 2.525, z: -1.2 }, { x: -1.8, y: 2.525, z: -1.2 },
      { x: -2.55, y: 3.025, z: -1.65 }, { x: -2.05, y: 3.025, z: -1.65 },
      { x: -2.55, y: 3.025, z: -1.35 }, { x: -2.05, y: 3.025, z: -1.35 },
      { x: -2.3, y: 3.525, z: -1.5 }
    ];
    pyramidPositions.forEach((pos) => {
      const cup = new THREE.Mesh(cupHolderGeo, cupMaterials);
      cup.position.set(pos.x, pos.y, pos.z);
      cup.rotation.y = Math.PI; // 컵홀더 정면 보게 180도 회전
      cup.castShadow = true;
      scene.add(cup);
    });

    // 16. Mini Standing Banner
    const standingBannerGroup = new THREE.Group();
    standingBannerGroup.position.set(2.7, 2.275, -1.8);
    standingBannerGroup.rotation.y = -Math.PI / 8;
    standingBannerGroup.scale.set(0.7, 0.7, 0.7);

    const sbGeo = new THREE.PlaneGeometry(1.4, 3.2);
    const sbMesh = new THREE.Mesh(sbGeo, standingBannerMaterial);
    sbMesh.position.set(0, 1.6, 0.05);
    standingBannerGroup.add(sbMesh);

    const sbBackGeo = new THREE.PlaneGeometry(1.4, 3.2);
    const sbBackMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
    const sbBack = new THREE.Mesh(sbBackGeo, sbBackMat);
    sbBack.rotation.y = Math.PI;
    sbBack.position.set(0, 1.6, 0.04);
    standingBannerGroup.add(sbBack);

    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.6);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x52525b,
      metalness: 0.6,
      roughness: 0.2,
    });
    const pole1 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(0, 1.6, -0.05);
    pole1.rotation.z = Math.PI / 8;
    standingBannerGroup.add(pole1);

    const pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole2.position.set(0, 1.6, -0.05);
    pole2.rotation.z = -Math.PI / 8;
    standingBannerGroup.add(pole2);
    scene.add(standingBannerGroup);

    // 17. Circular Table & Acrylic Stand (아크릴 스탠드 위치 및 재질 보완)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 4.5);

    const tableTopGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.1, 32);
    const tableTop = new THREE.Mesh(tableTopGeo, tableMaterial);
    tableTop.position.y = 1.6;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    const tableLegGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.6, 16);
    const tableLegMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.5,
      roughness: 0.3,
    });
    const tableLeg = new THREE.Mesh(tableLegGeo, tableLegMat);
    tableLeg.position.y = 0.8;
    tableLeg.castShadow = true;
    tableGroup.add(tableLeg);

    const tableBaseGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.05, 24);
    const tableBase = new THREE.Mesh(tableBaseGeo, tableLegMat);
    tableBase.position.y = 0.025;
    tableGroup.add(tableBase);
    scene.add(tableGroup);

    // ⭐️ 아크릴 스탠드 본체 (테이블 위)
    const tablePropGeo = new THREE.PlaneGeometry(0.6, 0.9);
    const tableProp = new THREE.Mesh(tablePropGeo, tablePropMat);
    tableProp.position.set(0, 2.1, 4.5);
    tableProp.rotation.y = -Math.PI / 6;
    scene.add(tableProp);

    // 아크릴 받침대
    const tablePropBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.15), metalMat);
    tablePropBase.position.set(0, 1.67, 4.5);
    tablePropBase.rotation.y = -Math.PI / 6;
    scene.add(tablePropBase);

    // 18. Chairs
    function createChair(posX: number, posZ: number, rotY: number) {
      const chair = new THREE.Group();
      chair.position.set(posX, 0, posZ);
      chair.rotation.y = rotY;

      const seatGeo = new THREE.BoxGeometry(1.3, 0.15, 1.3);
      const seat = new THREE.Mesh(seatGeo, chairMaterial);
      seat.position.y = 1.0;
      seat.castShadow = true;
      chair.add(seat);

      const backrestGeo = new THREE.BoxGeometry(1.3, 0.9, 0.15);
      const backrest = new THREE.Mesh(backrestGeo, chairMaterial);
      backrest.position.set(0, 1.45, -0.55);
      backrest.castShadow = true;
      chair.add(backrest);

      const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 1.0, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });

      const legPositions = [
        [-0.55, 0.5, -0.55],
        [0.55, 0.5, -0.55],
        [-0.55, 0.5, 0.55],
        [0.55, 0.5, 0.55],
      ];

      legPositions.forEach((pos) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        chair.add(leg);
      });
      scene.add(chair);
    }

    createChair(-2.8, 4.5, Math.PI / 2);
    createChair(2.8, 4.5, -Math.PI / 2);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  const resetCamera = (preset: 'default' | 'top' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveCamPreset(preset);

    if (preset === 'default') {
      cameraRef.current.position.set(0, 15, 17);
      controlsRef.current.target.set(0, 1.5, 0);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 25, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'front') {
      cameraRef.current.position.set(0, 3, 14);
      controlsRef.current.target.set(0, 2, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-start pt-20 sm:pt-24 pb-16 px-3 sm:px-6">
      {/* Title */}
      <div className="text-center mb-6 max-w-xl px-2">
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c084fc] mb-1 font-bold">
          3D INTERACTIVE SPACE
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-2">
          MINIROOM
        </h1>
        <p className="text-[11px] sm:text-xs text-[#A1A1AA] leading-normal break-keep">
          3D 생일카페 미니룸 (드래그하여 360° 회전 및 관람해보세요!)
        </p>
      </div>

      {/* Camera Preset Toolbar */}
      <div className="flex flex-nowrap justify-center items-center gap-1.5 sm:gap-2 mb-6 bg-[#18181B] border border-[#3F3F46] p-1.5 rounded-none text-xs font-bold uppercase tracking-wider max-w-full overflow-x-auto">
        <button
          onClick={() => resetCamera('default')}
          className={`px-3 sm:px-4 py-2 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs ${
            activeCamPreset === 'default'
              ? 'bg-[#FAFAFA] text-[#0A0A0A]'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">기본 뷰</span>
        </button>
        <button
          onClick={() => resetCamera('front')}
          className={`px-3 sm:px-4 py-2 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs ${
            activeCamPreset === 'front'
              ? 'bg-[#FAFAFA] text-[#0A0A0A]'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
          }`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">정면 뷰</span>
        </button>
        <button
          onClick={() => resetCamera('top')}
          className={`px-3 sm:px-4 py-2 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs ${
            activeCamPreset === 'top'
              ? 'bg-[#FAFAFA] text-[#0A0A0A]'
              : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
          }`}
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">탑 뷰 (Top)</span>
        </button>
      </div>

      {/* Canvas Container */}
      <div className="w-full max-w-[900px] h-[420px] sm:h-[550px] bg-[#18181B] border border-[#3F3F46] rounded-none overflow-hidden relative shadow-none touch-none">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

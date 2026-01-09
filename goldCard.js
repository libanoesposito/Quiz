/**
 * GESTORE CARD 3D GOLD (Luxury Edition v4.0)
 * Fixes: Z-Fighting (Empty Card), Brushed Metal Texture, Async Download
 */
console.log("GoldCardManager v4.0 loaded");

const GoldCardManager = {
    scene: null,
    camera: null,
    renderer: null,
    cardGroup: null,
    controls: null,
    animationId: null,
    container: null,

    init: function(containerElement, userData) {
        this.container = containerElement;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = null;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 14);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            preserveDrawingBuffer: false, // FIX performance
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // LUCI STUDIO
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
        mainLight.position.set(5, 5, 10);
        this.scene.add(mainLight);

        const rimLight = new THREE.SpotLight(0xffd700, 2.0);
        rimLight.position.set(-5, 10, -10);
        rimLight.lookAt(0,0,0);
        this.scene.add(rimLight);

        const cameraLight = new THREE.PointLight(0xffeeb1, 0.6);
        this.camera.add(cameraLight);
        this.scene.add(this.camera);

        this.createLuxuryCard(userData);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 20;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2.0;

        this.animate();
        window.addEventListener('resize', this.onResize.bind(this));
    },

    createLuxuryCard: function(user) {
        this.cardGroup = new THREE.Group();

        const width = 8.56;
        const height = 5.398;
        const radius = 0.5;
        const shape = new THREE.Shape();

        shape.moveTo(-width/2 + radius, -height/2);
        shape.lineTo(width/2 - radius, -height/2);
        shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
        shape.lineTo(width/2, height/2 - radius);
        shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
        shape.lineTo(-width/2 + radius, height/2);
        shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
        shape.lineTo(-width/2, -height/2 + radius);
        shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);

        const extrudeSettings = {
            depth: 0.03,            
            bevelEnabled: true,
            bevelSegments: 3,
            bevelSize: 0.02,
            bevelThickness: 0.02,
            curveSegments: 24
        };

        const geometryBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometryBody.center();
        geometryBody.computeBoundingBox(); 
        const maxZ = geometryBody.boundingBox.max.z;

        const materialGold = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.35,
            side: THREE.FrontSide
        });

        const bodyMesh = new THREE.Mesh(geometryBody, materialGold);
        this.cardGroup.add(bodyMesh);

        const geometryFace = new THREE.ShapeGeometry(shape, 24);
        const texture = this.createCardTexture(user);

        const materialFace = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            metalness: 0.6,
            roughness: 0.4,
            depthWrite: false,
            depthTest: true
        });

        const faceMesh = new THREE.Mesh(geometryFace, materialFace);
        faceMesh.position.z = maxZ + 0.01; 
        this.cardGroup.add(faceMesh);

        this.scene.add(this.cardGroup);
    },

    createCardTexture: function(user) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;  
        canvas.height = 323;
        const ctx = canvas.getContext('2d');

        const grd = ctx.createLinearGradient(0, 0, 512, 323);
        grd.addColorStop(0, "#b88a4d");
        grd.addColorStop(0.4, "#fdfcbf");
        grd.addColorStop(0.6, "#d4af37");
        grd.addColorStop(1, "#8a6e2f");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 512, 323);

        this.addBrushedMetalEffect(ctx, 512, 323);
        this.addNoise(ctx, 512, 323);

        // Bordo
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 6;
        ctx.strokeRect(15, 15, 482, 293);

        // Chip & Contactless
        this.drawChip(ctx, 45, 110);
        this.drawContactless(ctx, 450, 160);

        // TESTI
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.font = "800 24px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.textAlign = "right";
        ctx.fillText("UTENTE GOLD", 480, 45);

        ctx.textAlign = "left";
        ctx.font = "600 28px 'Courier New', monospace";
        ctx.fillStyle = "#1d1d1f";
        ctx.shadowColor = "rgba(255,255,255,0.3)";
        ctx.fillText(user.name.toUpperCase(), 45, 210);

        ctx.font = "500 12px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#333";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = "500 10px 'Helvetica Neue', sans-serif";
        ctx.fillText("ID UTENTE", 45, 270);
        ctx.fillText("ISCRITTO DAL", 190, 270);

        ctx.font = "700 16px 'Courier New', monospace";
        ctx.fillStyle = "#000";
        ctx.fillText(user.id, 45, 290);
        ctx.fillText(user.date, 190, 290);

        // QR CODE
        const qr = new QRious({
            value: window.location.href,
            size: 85,
            backgroundAlpha: 0,
            foreground: '#1d1d1f'
        });
        ctx.drawImage(qr.canvas, 400, 215);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = Math.min(
            4,
            this.renderer.capabilities.getMaxAnisotropy()
        );

        return texture;
    },

    addBrushedMetalEffect: function(ctx, w, h) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 600; i++) { 
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(
                Math.random() * w,
                Math.random() * h,
                Math.random() * w,
                Math.random() * 2
            );
        }
        ctx.restore();
    },

    drawChip: function(ctx, x, y) {
        ctx.fillStyle = "#e0e0e0";
        ctx.beginPath();
        ctx.roundRect(x, y, 70, 55, 8);
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y+28); ctx.lineTo(x+70, y+28);
        ctx.moveTo(x+35, y); ctx.lineTo(x+35, y+55);
        ctx.stroke();
        ctx.strokeRect(x+22, y+15, 25, 25);
    },

    drawContactless: function(ctx, x, y) {
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(x, y, 7, -Math.PI/2, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 17, -Math.PI/2.2, 0.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 27, -Math.PI/2.5, 0.4); ctx.stroke();
    },

    addNoise: function(ctx, w, h) {
        const idata = ctx.getImageData(0, 0, w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        for (let i = 0; i < buffer32.length; i++) {
            if (Math.random() < 0.15) {
                const val = Math.random() < 0.5 ? -10 : 10;
                buffer32[i] = ((buffer32[i] & 0xff000000) | ((buffer32[i] & 0x00ffffff) + (val * 0x010101)));
            }
        }
        ctx.putImageData(idata, 0, 0);
    },

    animate: function() {
        if (!this.container.offsetParent) return;
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    onResize: function() {
        if (!this.container || !this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    downloadSnapshot: function(btnElement) {
        if (!this.renderer) return;
        
        const originalText = btnElement ? btnElement.innerText : "Salva Foto";
        if(btnElement) { btnElement.innerText = "Elaborazione..."; btnElement.disabled = true; }

        this.renderer.render(this.scene, this.camera);
        
        this.renderer.domElement.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'QuizPro_GoldCard.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            if(btnElement) { btnElement.innerText = originalText; btnElement.disabled = false; }
        }, 'image/png');
    },

    downloadGLTF: function(btnElement) {
        if (!this.cardGroup) return;
        if (typeof THREE.GLTFExporter === 'undefined') {
            alert("Errore: Libreria esportazione non caricata.");
            return;
        }

        const originalText = btnElement ? btnElement.innerText : "Scarica 3D";
        if(btnElement) { btnElement.innerText = "Esportazione..."; btnElement.disabled = true; }
        
        setTimeout(() => {
            try {
                const exporter = new THREE.GLTFExporter();
                exporter.parse(
                    this.cardGroup,
                    function (gltf) {
                        const output = JSON.stringify(gltf, null, 2);
                        const blob = new Blob([output], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.download = 'QuizPro_GoldCard.gltf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        if(btnElement) { btnElement.innerText = originalText; btnElement.disabled = false; }
                    },
                    { binary: false }
                );
            } catch(e) {
                console.error(e);
                if(btnElement) { btnElement.innerText = "Errore"; btnElement.disabled = false; }
            }
        }, 50);
    },

    dispose: function() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize);
        if (this.renderer) {
            this.renderer.dispose();
            this.container.innerHTML = '';
        }
        this.scene = null;
        this.camera = null;
        this.controls = null;
    }
};


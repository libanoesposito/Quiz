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
            preserveDrawingBuffer: true,
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

        // 1. GEOMETRIA CORPO
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
            depth: 0.02, // Molto più sottile (realistico)
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.02, // Smusso fine
            bevelThickness: 0.02, // Spessore smusso ridotto
            curveSegments: 24
        };

        const geometryBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometryBody.center(); // CENTRA LA GEOMETRIA (Cruciale per la rotazione)
        
        // Calcolo Z offset per le facce (metà spessore totale + epsilon)
        const zOffset = (extrudeSettings.depth / 2) + extrudeSettings.bevelThickness + 0.002;

        const materialGold = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.8,
            roughness: 0.3,
            side: THREE.DoubleSide
        });

        const bodyMesh = new THREE.Mesh(geometryBody, materialGold);
        this.cardGroup.add(bodyMesh);

        // 2. FACCIA ANTERIORE (Front)
        const geometryFront = new THREE.ShapeGeometry(shape, 24);
        this.applyUVs(geometryFront, width, height);

        const textureFront = this.createFrontTexture(user);
        
        const materialFront = new THREE.MeshStandardMaterial({
            map: textureFront,
            transparent: true,
            metalness: 0.1, // Basso per leggibilità testo
            roughness: 0.4
        });

        const frontMesh = new THREE.Mesh(geometryFront, materialFront);
        frontMesh.position.z = zOffset; 
        this.cardGroup.add(frontMesh);

        // 3. FACCIA POSTERIORE (Back)
        const geometryBack = new THREE.ShapeGeometry(shape, 24);
        this.applyUVs(geometryBack, width, height);

        const textureBack = this.createBackTexture(user);
        
        const materialBack = new THREE.MeshStandardMaterial({
            map: textureBack,
            transparent: true,
            metalness: 0.1,
            roughness: 0.4
        });

        const backMesh = new THREE.Mesh(geometryBack, materialBack);
        backMesh.position.z = -zOffset;
        backMesh.rotation.y = Math.PI; // Ruota per guardare indietro
        this.cardGroup.add(backMesh);

        this.scene.add(this.cardGroup);
    },

    applyUVs: function(geometry, width, height) {
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;
        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);
            const u = (x + width / 2) / width;
            const v = (y + height / 2) / height;
            uvAttribute.setXY(i, u, v);
        }
        geometry.attributes.uv.needsUpdate = true;
    },

    createFrontTexture: function(user) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 646;
        const ctx = canvas.getContext('2d');

        // 1. SFONDO ORO (Più chiaro per contrasto testo)
        const diagGrd = ctx.createLinearGradient(0, 0, 1024, 646);
        diagGrd.addColorStop(0, "#8a6e2f");   // Bronzo scuro
        diagGrd.addColorStop(0.2, "#d4af37"); // Oro classico
        diagGrd.addColorStop(0.4, "#fdfcbf"); // Luce speculare
        diagGrd.addColorStop(0.6, "#d4af37"); // Oro classico
        diagGrd.addColorStop(1, "#5e4b20");   // Ombra profonda
        
        ctx.fillStyle = diagGrd;
        ctx.fillRect(0, 0, 1024, 646);

        // EFFETTO SPAZZOLATURA METALLICA
        this.addBrushedMetalEffect(ctx, 1024, 646);
        this.addNoise(ctx, 1024, 646);

        // 2. ELEMENTI TECNICI (Chip & Contactless)
        this.drawChip(ctx, 140, 250);
        this.drawContactless(ctx, 920, 100);

        // 3. LOGHI E SCRITTE "PREMIUM"
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Header Alto
        ctx.font = "700 32px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.textAlign = "left";
        ctx.fillText("QUIZ MASTER", 60, 80);
        
        ctx.font = "italic 600 24px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.textAlign = "right";
        ctx.fillText("WORLD ELITE", 860, 80);

        // 4. NUMERO CARTA (Simulato con ID)
        const padId = String(user.id || '0000').padStart(4, '0');
        const cardNumber = `5412 7500 8890 ${padId}`;
        
        ctx.textAlign = "center";
        ctx.font = "500 64px 'Courier New', monospace"; // Font monospaziato per effetto rilievo
        // Effetto rilievo (Emboss) Argento/Bianco
        ctx.fillStyle = "#1a1a1a"; // Ombra interna scura
        ctx.shadowColor = "rgba(255,255,255,0.4)"; // Luce bordo inferiore
        ctx.shadowOffsetY = 2;
        ctx.fillText(cardNumber, 512, 380);
        
        // Reset ombre per testo normale
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowOffsetY = 1;

        // 5. DATI UTENTE (Basso Sinistra)
        ctx.textAlign = "left";
        
        // DATE (Affiancate)
        ctx.font = "400 10px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#333"; // Scuro per leggibilità su oro
        
        // Member Since
        ctx.fillText("MEMBER SINCE", 340, 430);
        ctx.font = "600 20px 'Courier New', monospace";
        ctx.fillStyle = "#111"; // Scuro
        ctx.fillText(user.memberSince, 340, 455);

        // Gold Since
        ctx.font = "400 10px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#333";
        ctx.fillText("GOLD SINCE", 520, 430);
        ctx.font = "600 20px 'Courier New', monospace";
        ctx.fillStyle = "#111";
        ctx.fillText(user.goldSince, 520, 455);

        // Nome Utente
        ctx.font = "600 36px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#111"; // Scuro per contrasto massimo
        ctx.fillText((user.name || 'UTENTE').toUpperCase(), 60, 580);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearFilter;
        return texture;
    },

    createBackTexture: function(user) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 646;
        const ctx = canvas.getContext('2d');

        // 1. SFONDO ORO (Leggermente più scuro/opaco per il retro)
        const grd = ctx.createLinearGradient(0, 0, 1024, 646);
        grd.addColorStop(0, "#b88a4d");
        grd.addColorStop(1, "#8a6e2f");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 1024, 646);
        this.addBrushedMetalEffect(ctx, 1024, 646);

        // 2. BANDA MAGNETICA (Nera)
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 60, 1024, 120);

        // 3. STRISCIA FIRMA (Bianca/Grigia)
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(60, 240, 600, 80);
        // Pattern firma
        ctx.font = "italic 24px 'Courier New'";
        ctx.fillStyle = "#ccc";
        ctx.fillText("Authorized Signature", 80, 290);

        // 4. CVC
        ctx.fillStyle = "#fff";
        ctx.font = "italic 700 32px 'Courier New'";
        ctx.fillText("CVC 982", 680, 290);

        // 5. QR CODE (A destra)
        const qr = new QRious({
            value: window.location.href,
            size: 200,
            backgroundAlpha: 0,
            foreground: '#000000' // Nero puro per contrasto
        });
        
        // Sfondo bianco per il QR per renderlo leggibile su oro
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(750, 380, 220, 220, 10);
        ctx.fill();
        
        ctx.drawImage(qr.canvas, 760, 390);

        // 6. PUNTEGGIO CLASSIFICA (A sinistra, grande)
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.font = "700 28px 'Helvetica Neue', sans-serif";
        ctx.fillText("TOTAL SCORE", 60, 420);

        ctx.font = "300 80px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(user.points || '0', 60, 500);

        ctx.font = "italic 18px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText("Quiz Master Official Ranking", 60, 540);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearFilter;
        return texture;
    },

    addBrushedMetalEffect: function(ctx, w, h) {
        // Disegna migliaia di linee sottili orizzontali per l'effetto spazzolato
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 3000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            const y = Math.random() * h;
            const height = Math.random() * 2;
            const width = Math.random() * w;
            const x = Math.random() * w;
            ctx.fillRect(x, y, width, height);
        }
        ctx.restore();
    },

    drawChip: function(ctx, x, y) {
        // Gradiente Chip
        const chipGrad = ctx.createLinearGradient(x, y, x+120, y+90);
        chipGrad.addColorStop(0, "#e6cfa3");
        chipGrad.addColorStop(1, "#d1b464");
        
        ctx.fillStyle = chipGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, 120, 90, 12);
        ctx.fill();
        
        // Linee circuito chip
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y+45); ctx.lineTo(x+120, y+45); // Orizzontale
        ctx.moveTo(x+60, y); ctx.lineTo(x+60, y+90);  // Verticale
        ctx.moveTo(x+30, y+20); ctx.lineTo(x+30, y+70); // Dettagli sx
        ctx.moveTo(x+90, y+20); ctx.lineTo(x+90, y+70); // Dettagli dx
        ctx.stroke();
        ctx.strokeRect(x+40, y+25, 40, 40); // Centro
    },

    drawContactless: function(ctx, x, y) {
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(x, y, 15, -Math.PI/2, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 35, -Math.PI/2.2, 0.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 55, -Math.PI/2.5, 0.4); ctx.stroke();
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

    // --- DOWNLOAD PNG ASINCRONO (Non blocca il PC) ---
    downloadSnapshot: function(btnElement) {
        if (!this.renderer) return;
        
        const originalText = btnElement ? btnElement.innerText : "Salva Foto";
        if(btnElement) { btnElement.innerText = "Elaborazione..."; btnElement.disabled = true; }

        // Renderizza un frame fresco
        this.renderer.render(this.scene, this.camera);
        
        // Usa toBlob invece di toDataURL per non bloccare il main thread
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

    // --- DOWNLOAD GLTF (Con controlli) ---
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

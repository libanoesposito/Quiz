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

        const isPink = userData.pinkMode;

        // LUCI STUDIO: Per il Pink usiamo una luce ambiente rosata per mantenere la saturazione nelle ombre
        const ambientColor = isPink ? 0xffd1dc : 0xffffff;
        const ambientIntensity = isPink ? 0.5 : 0.6;
        const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
        this.scene.add(ambientLight);

        // LUCI PRINCIPALI: Usiamo un rosa pallido (Warm Pink) invece del bianco per evitare l'effetto "slavato"
        const lightColor = isPink ? 0xffe6ea : 0xffd700; 

        // Abbassiamo l'intensità per il Pink per evitare riflessi speculari troppo forti
        const mainIntensity = isPink ? 0.6 : 1.0;
        const mainLight = new THREE.DirectionalLight(lightColor, mainIntensity);
        mainLight.position.set(5, 5, 10);
        this.scene.add(mainLight);

        const rimLight = new THREE.SpotLight(lightColor, 2.0);
        rimLight.position.set(-5, 10, -10);
        rimLight.lookAt(0,0,0);
        this.scene.add(rimLight);

        const cameraLight = new THREE.PointLight(lightColor, 0.5); // Luce camera
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

        const isPink = user.pinkMode;

        const materialGold = new THREE.MeshStandardMaterial({
            color: isPink ? 0xb05d6e : 0xffd700, // Rose Gold ancora più scuro per il corpo
            // PER IL PINK: Riduciamo metalness per far vedere il colore "verniciato" e non solo il riflesso scuro
            metalness: isPink ? 0.6 : 1.0,  
            roughness: isPink ? 0.35 : 0.15, 
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
            transparent: true,  // Ripristinato per il web (più bello)
            metalness: 0.5,     // Ripristinato oro
            roughness: 0.2,
            side: THREE.DoubleSide
        });

        const frontMesh = new THREE.Mesh(geometryFront, materialFront);
        frontMesh.position.z = zOffset; 
        this.cardGroup.add(frontMesh);

        // 3. FACCIA POSTERIORE (Back)
        const geometryBack = new THREE.ShapeGeometry(shape, 24);
        this.applyUVs(geometryBack, width, height, false); // FIX: Rimosso flipX che causava l'effetto specchio

        const textureBack = this.createBackTexture(user);
        
        const materialBack = new THREE.MeshStandardMaterial({
            map: textureBack,
            transparent: true,
            metalness: 0.5,
            roughness: 0.2,
            side: THREE.DoubleSide
        });

        const backMesh = new THREE.Mesh(geometryBack, materialBack);
        backMesh.position.z = -zOffset;
        backMesh.rotation.y = Math.PI; // Ruota per guardare indietro
        this.cardGroup.add(backMesh);

        this.scene.add(this.cardGroup);
    },

    applyUVs: function(geometry, width, height, flipX = false) {
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;
        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);
            let u = (x + width / 2) / width;
            const v = (y + height / 2) / height;
            if (flipX) u = 1 - u; // Inverte la texture orizzontalmente
            uvAttribute.setXY(i, u, v);
        }
        geometry.attributes.uv.needsUpdate = true;
    },

    createFrontTexture: function(user) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 646;
        const ctx = canvas.getContext('2d');

        const isPink = user.pinkMode;

        // 1. SFONDO ORO UNIFORME (Identico al retro)
        const diagGrd = ctx.createLinearGradient(0, 0, 1024, 646);
        if (isPink) {
            diagGrd.addColorStop(0, "#96505b");   // Deep Rose Dark
            diagGrd.addColorStop(0.5, "#e6bbc5"); // Muted Rose Mid
            diagGrd.addColorStop(1, "#85404b");   // Deep Rose Darkest
        } else {
            diagGrd.addColorStop(0, "#b88a4d");   // Bronzo scuro
            diagGrd.addColorStop(0.5, "#d4af37"); // Oro classico
            diagGrd.addColorStop(1, "#8a6e2f");   // Ombra profonda
        }
        
        ctx.fillStyle = diagGrd;
        ctx.fillRect(0, 0, 1024, 646);

        // EFFETTO SPAZZOLATURA (Senza Noise/Brillantini)
        this.addBrushedMetalEffect(ctx, 1024, 646);
        // this.addNoise(ctx, 1024, 646); // RIMOSSO: Causava l'effetto "brillantinato"

        // 2. ELEMENTI TECNICI (Chip & Contactless)
        this.drawChip(ctx, 140, 200); // SPOSTATO IN ALTO (Era 250) per non toccare i numeri
        this.drawContactless(ctx, 920, 100);

        // 3. LOGHI E SCRITTE "PREMIUM"
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Colore Testi: BRONZO SCURO (Uniformità con l'oro) invece di bianco/nero
        const textMain = isPink ? "#d4af37" : "#000000"; // Oro se Pink, Nero se Gold

        // Header Alto
        ctx.font = "700 32px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = textMain;
        ctx.textAlign = "left";
        ctx.fillText("QUIZ MASTER", 60, 80);
        
        ctx.font = "italic 600 24px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = textMain;
        ctx.globalAlpha = 0.8; // Leggera trasparenza per eleganza
        ctx.textAlign = "right";
        ctx.fillText("WORLD ELITE", 860, 80);
        ctx.globalAlpha = 1.0;

        // 4. NUMERO CARTA (Simulato con ID)
        const padId = String(user.id || '0000').padStart(4, '0');
        const cardNumber = `5412 7500 8890 ${padId}`;
        
        ctx.textAlign = "center";
        ctx.font = "700 66px 'Courier New', monospace"; 
        
        // NUMERO CARTA: Niente rilievo, solo testo scuro e leggibile
        ctx.shadowColor = "rgba(255,255,255,0.3)"; // Leggera luce sotto per staccare
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = textMain;
        
        ctx.fillText(cardNumber, 512, 380);
        
        // Reset ombre per i testi successivi (Stile Inciso/Stampato scuro)
        ctx.shadowColor = "transparent"; 
        ctx.shadowBlur = 0;

        // 5. DATI UTENTE (Basso Sinistra)
        ctx.textAlign = "left";
        
        // DATE (Affiancate)
        ctx.font = "600 13px 'Helvetica Neue', sans-serif"; // Etichette più grandi
        ctx.fillStyle = textMain;
        
        // Member Since
        ctx.fillText("ISCRITTO DAL", 340, 430); // ITALIANO
        ctx.font = "700 26px 'Courier New', monospace"; // Date molto più visibili
        ctx.fillStyle = textMain;
        ctx.fillText(user.memberSince, 340, 455);

        // Nome Utente
        ctx.font = "800 42px 'Helvetica Neue', sans-serif"; // Più grande e bold
        ctx.fillStyle = textMain;
        const nameText = (user.name || 'UTENTE').toUpperCase();
        ctx.fillText(nameText, 60, 580);

        // Scritta "Miglior Programmatore" accanto al nome
        const nameWidth = ctx.measureText(nameText).width;
        
        // FONT PIÙ GRANDE E ANNO
        ctx.font = "italic 700 46px 'Helvetica Neue', sans-serif"; // Aumentato a 46px come richiesto
        ctx.fillStyle = isPink ? "#d4af37" : "#333333"; 
        
        // Estrazione Anno (es. da "05/24" -> "2024")
        let year = new Date().getFullYear();
        if (user.goldSince && user.goldSince.includes('/')) {
            year = "20" + user.goldSince.split('/')[1];
        }
        ctx.fillText(`Miglior Programmatore ${year}`, 60 + nameWidth + 30, 580);

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

        const isPink = user.pinkMode;

        // 1. SFONDO ORO (Identico al fronte)
        const grd = ctx.createLinearGradient(0, 0, 1024, 646);
        if (isPink) {
            grd.addColorStop(0, "#96505b");
            grd.addColorStop(0.5, "#e6bbc5");
            grd.addColorStop(1, "#85404b");
        } else {
            grd.addColorStop(0, "#b88a4d");
            grd.addColorStop(0.5, "#d4af37");
            grd.addColorStop(1, "#8a6e2f");
        }
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
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "italic 60px 'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive"; // Firma più grande e realistica
        ctx.fillStyle = "#000000"; // La firma resta nera per realismo (inchiostro)
        const signature = user.name || "Firma Autorizzata";
        ctx.fillText(signature, 80, 280); 
        ctx.textBaseline = "alphabetic"; // Reset

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

        const textMain = isPink ? "#d4af37" : "#000000";

        ctx.textAlign = "left";
        ctx.fillStyle = textMain;
        ctx.font = "700 28px 'Helvetica Neue', sans-serif";
        ctx.fillText("PUNTEGGIO TOTALE", 60, 420); // ITALIANO

        ctx.font = "300 80px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = textMain;
        ctx.fillText(user.points || '0', 60, 500);

        ctx.font = "italic 18px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = textMain;
        ctx.fillText("Classifica Ufficiale Quiz Master", 60, 540); // ITALIANO

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
        chipGrad.addColorStop(0, "#fff8e1"); // Oro molto chiaro/Platino per visibilità
        chipGrad.addColorStop(0.5, "#e6cfa3");
        chipGrad.addColorStop(1, "#b8860b"); // Oro scuro
        
        ctx.fillStyle = chipGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, 120, 90, 12);
        ctx.fill();
        
        // Bordo sottile per staccarlo dallo sfondo
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
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

    // Helper per invertire UV (Fix specchio iOS)
    flipUVsHorizontal: function(group) {
        group.traverse((child) => {
            if (child.isMesh && child.geometry && child.geometry.attributes.uv) {
                const uvAttribute = child.geometry.attributes.uv;
                for (let i = 0; i < uvAttribute.count; i++) {
                    const u = uvAttribute.getX(i);
                    uvAttribute.setX(i, 1 - u);
                }
                uvAttribute.needsUpdate = true;
            }
        });
    },

    // --- REGISTRAZIONE VIDEO 360° (WebM) ---
    recordVideo: function(btnElement) {
        if (!this.renderer) return;
        
        const canvas = this.renderer.domElement;
        // Cattura lo stream del canvas a 30fps
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks = [];
        
        recorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
        
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'QuizMaster_GoldCard_360.webm';
            a.click();
            URL.revokeObjectURL(url);
            
            // Ripristina UI
            if(btnElement) { btnElement.innerText = "🎥 Video 360°"; btnElement.disabled = false; }
            this.controls.autoRotate = true; // Riprendi rotazione normale
        };

        // Setup Animazione Registrazione
        if(btnElement) { btnElement.innerText = "Registrazione..."; btnElement.disabled = true; }
        
        this.controls.autoRotate = false; // Disabilita auto-rotate standard
        this.cardGroup.rotation.y = 0;    // Reset posizione
        
        recorder.start();
        
        // Esegui una rotazione completa in 4 secondi
        const duration = 4000;
        const start = performance.now();
        
        const animateRecord = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ruota di 360 gradi (2PI)
            this.cardGroup.rotation.y = progress * Math.PI * 2;
            this.renderer.render(this.scene, this.camera);
            
            if (progress < 1) {
                requestAnimationFrame(animateRecord);
            } else {
                recorder.stop();
            }
        };
        
        requestAnimationFrame(animateRecord);
    },

    // --- DOWNLOAD SMART (GLB o USDZ) ---
    downloadSmart: function(btnElement) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) {
            this.downloadUSDZ(btnElement);
        } else {
            this.downloadGLB(btnElement);
        }
    },

    // --- DOWNLOAD USDZ (iOS AR) ---
    downloadUSDZ: function(btnElement) {
        if (!this.cardGroup) return;
        if (typeof THREE.USDZExporter === 'undefined') {
            alert("Errore: Libreria USDZ non caricata.");
            return;
        }

        const originalText = btnElement ? btnElement.innerText : "Scarica USDZ";
        if(btnElement) { btnElement.innerText = "Esportazione..."; btnElement.disabled = true; }
        
        // Usa requestAnimationFrame per non bloccare la UI ma rimanere nel ciclo di rendering
        requestAnimationFrame(async () => {
            try {
                // 1. SCALA PER AR (Realtà Aumentata)
                // La card è larga 8.56 units. In AR 1 unit = 1 metro.
                // Scaliamo a dimensioni reali (carta credito ~8.5cm = 0.085m)
                const originalScale = this.cardGroup.scale.clone();
                const originalRotation = this.cardGroup.rotation.clone(); // Backup rotazione

                // 1. SCALA POSITIVA (Fix invisibilità/oro solido)
                this.cardGroup.scale.multiplyScalar(0.01); 
                
                // 2. RESET ROTAZIONE (Fix orientamento e specchio)
                // Ruotiamo di 180° su Z per raddrizzarla (altrimenti appare capovolta in AR)
                this.cardGroup.rotation.set(0, 0, Math.PI);
                this.cardGroup.updateMatrixWorld();

                // 3. FIX SPECCHIO: Invertiamo UV orizzontalmente
                this.flipUVsHorizontal(this.cardGroup);

                const exporter = new THREE.USDZExporter();
                const arraybuffer = await exporter.parse(this.cardGroup);
                
                // 4. RIPRISTINO (Invertiamo di nuovo per tornare normale)
                this.flipUVsHorizontal(this.cardGroup);
                this.cardGroup.scale.copy(originalScale);
                this.cardGroup.rotation.copy(originalRotation); // Ripristina rotazione
                this.cardGroup.updateMatrixWorld();

                const blob = new Blob([arraybuffer], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.download = 'QuizMaster_GoldCard.usdz';
                link.rel = 'noopener'; // Sicurezza per iOS
                document.body.appendChild(link);
                link.click();
                
                // Ritardo pulizia per iOS
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);

                if(btnElement) { btnElement.innerText = originalText; btnElement.disabled = false; }
            } catch(e) {
                console.error(e);
                // Ripristina scala in caso di errore
                this.cardGroup.scale.set(1,1,1);
                // Mostra l'errore specifico
                alert("Errore esportazione USDZ: " + (e.message || e));
                if(btnElement) { btnElement.innerText = "Errore"; btnElement.disabled = false; }
            }
        });
    },

    // --- DOWNLOAD GLB (Binario) ---
    downloadGLB: function(btnElement) {
        if (!this.cardGroup) return;
        if (typeof THREE.GLTFExporter === 'undefined') {
            alert("Errore: Libreria esportazione non caricata.");
            return;
        }

        const originalText = btnElement ? btnElement.innerText : "Scarica GLB";
        if(btnElement) { btnElement.innerText = "Esportazione..."; btnElement.disabled = true; }
        
        setTimeout(() => {
            try {
                const exporter = new THREE.GLTFExporter();
                exporter.parse(
                    this.cardGroup,
                    function (result) {
                        // result è un ArrayBuffer se binary=true
                        const blob = new Blob([result], { type: 'model/gltf-binary' });
                        const url = URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.download = 'QuizMaster_GoldCard.glb';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        if(btnElement) { btnElement.innerText = originalText; btnElement.disabled = false; }
                    },
                    { binary: true } // FORZA FORMATO GLB
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

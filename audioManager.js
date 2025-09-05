class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this._unlocked = false;
        this.vol = 0.18;
        this._setupUnlock();

        // --- Background Music ---
        this._bgmUrl = "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/audio-assets/620dfb9b-13c8-4733-a462-aea820328b33/63467f58-a42f-4688-9e80-5fa8fe0c6e77.MP3";
        this._bgmAudio = null;
        this._bgmLoaded = false;
        this._bgmStarted = false;
        this._bgmVolume = 0.18;
        this._setupBGM();
    }

    _setupUnlock() {
        // Unlock audio context on first interaction (mobile)
        window.addEventListener('pointerdown', () => this._unlock(), { once: true });
        window.addEventListener('keydown', () => this._unlock(), { once: true });
    }

    _unlock() {
        if (this._unlocked) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._unlocked = true;
            // Start background music after unlock
            this.playBGM();
        } catch (e) { this.enabled = false; }
    }

    // --- Background Music Methods ---
    _setupBGM() {
        // Create <audio> element for background music
        this._bgmAudio = document.createElement('audio');
        this._bgmAudio.src = this._bgmUrl;
        this._bgmAudio.loop = true;
        this._bgmAudio.preload = "auto";
        this._bgmAudio.volume = this._bgmVolume;
        this._bgmAudio.setAttribute('tabindex', '-1');
        this._bgmAudio.setAttribute('aria-hidden', 'true');
        this._bgmAudio.style.display = "none";
        document.body.appendChild(this._bgmAudio);

        // Prevent autoplay until user interaction
        this._bgmAudio.addEventListener('canplaythrough', () => {
            this._bgmLoaded = true;
        });
    }

    playBGM() {
        if (!this.enabled) return;
        if (!this._bgmAudio) return;
        if (this._bgmStarted) return;
        this._bgmStarted = true;
        // Try to play, catch errors (autoplay policy)
        this._bgmAudio.volume = this._bgmVolume;
        this._bgmAudio.currentTime = 0;
        this._bgmAudio.play().catch(() => {
            // If failed, allow another attempt on next unlock
            this._bgmStarted = false;
        });
    }

    stopBGM() {
        if (this._bgmAudio) {
            this._bgmAudio.pause();
            this._bgmAudio.currentTime = 0;
            this._bgmStarted = false;
        }
    }

    // Optionally allow muting/unmuting BGM if needed in future
    setBGMVolume(vol) {
        this._bgmVolume = vol;
        if (this._bgmAudio) this._bgmAudio.volume = vol;
    }

    playJump() {
        if (!this.enabled || !this._unlocked) return;
        // Simple jump chirp
        let ctx = this.ctx;
        let o = ctx.createOscillator();
        let g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = 560;
        // Lower the chicken movement volume by 30% (from 40% to 28% of the main volume)
        g.gain.value = this.vol * 0.28;
        o.connect(g).connect(ctx.destination);
        o.start();
        o.frequency.linearRampToValueAtTime(620, ctx.currentTime + 0.06);
        o.frequency.linearRampToValueAtTime(370, ctx.currentTime + 0.18);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
        o.stop(ctx.currentTime + 0.23);
    }

    playCrash() {
        if (!this.enabled || !this._unlocked) return;
        // White noise burst for crash
        let ctx = this.ctx;
        let buffer = ctx.createBuffer(1, ctx.sampleRate * 0.17, ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++)
            data[i] = Math.random() * 2 - 1;
        let noise = ctx.createBufferSource();
        noise.buffer = buffer;
        let g = ctx.createGain();
        // Lower the crash volume by 35%
        g.gain.value = this.vol * 1.2 * 0.65;
        noise.connect(g).connect(ctx.destination);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.17);
        noise.start();
        noise.stop(ctx.currentTime + 0.18);
    }

    playWin() {
        if (!this.enabled || !this._unlocked) return;
        // Fun little arpeggio
        let ctx = this.ctx;
        let base = 392;
        [0, 80, 180].forEach((delay, i) => {
            setTimeout(() => {
                let o = ctx.createOscillator();
                let g = ctx.createGain();
                o.type = 'triangle';
                o.frequency.value = base * Math.pow(1.26, i);
                g.gain.value = this.vol * 1.15;
                o.connect(g).connect(ctx.destination);
                g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.21);
                o.start();
                o.stop(ctx.currentTime + 0.22);
            }, delay);
        });
    }
}
window.AudioManager = AudioManager;
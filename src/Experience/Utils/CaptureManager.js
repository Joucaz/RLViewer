// src/Experience/Utils/CaptureManager.js - Version avec background composite
import Experience from '../Experience.js'

export default class CaptureManager {
    constructor() {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.isRecording = false
        this.recorder = null
        this.recordedChunks = []
    }
    
    /**
     * Cache l'UI avant la capture
     */
    hideUI() {
        const ui = document.querySelector('.customization-ui')
        if (ui) ui.style.display = 'none'
    }
    
    /**
     * Affiche l'UI après la capture
     */
    showUI() {
        const ui = document.querySelector('.customization-ui')
        if (ui) ui.style.display = 'flex'
    }
    
    /**
     * Récupère le gradient de background actuel
     */
    getCurrentBackground() {
        const bgElement = document.querySelector('.background-gradient')
        if (!bgElement) return null
        
        return window.getComputedStyle(bgElement).background
    }
    
    /**
     * Ajoute un effet de flash blanc
     */
    async flashEffect() {
        // 🆕 Son de clic de caméra (optionnel)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.05)
        } catch (e) {
            // Ignore si audio échoue
        }
        
        // Crée l'overlay de flash
        const flash = document.createElement('div')
        flash.style.position = 'fixed'
        flash.style.top = '0'
        flash.style.left = '0'
        flash.style.width = '100vw'
        flash.style.height = '100vh'
        flash.style.backgroundColor = 'white'
        flash.style.opacity = '0'
        flash.style.zIndex = '99999'
        flash.style.pointerEvents = 'none'
        flash.style.transition = 'opacity 0.1s ease-out'
        
        document.body.appendChild(flash)
        
        // Force un reflow pour que la transition fonctionne
        flash.offsetHeight
        
        // Flash: opacité à 0.8
        flash.style.opacity = '0.8'
        
        // Attend 100ms
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Fade out
        flash.style.transition = 'opacity 0.3s ease-out'
        flash.style.opacity = '0'
        
        // Attend la fin de l'animation puis supprime
        await new Promise(resolve => setTimeout(resolve, 300))
        document.body.removeChild(flash)
    }
    
    /**
     * Capture une image PNG avec le background
     */
    async captureImage() {
        console.log('📸 Capturing image with background...')
        
        // Cache l'UI
        this.hideUI()
        
        // Attend un frame pour que le rendu soit propre
        await new Promise(resolve => requestAnimationFrame(resolve))
        
        try {
            const threeCanvas = this.renderer.instance.domElement
            const background = this.getCurrentBackground()
            
            // Crée un canvas composite
            const compositeCanvas = document.createElement('canvas')
            compositeCanvas.width = threeCanvas.width
            compositeCanvas.height = threeCanvas.height
            const ctx = compositeCanvas.getContext('2d')
            
            // 1. Dessine le background
            if (background) {
                // Crée un canvas temporaire pour le background
                const bgCanvas = document.createElement('canvas')
                bgCanvas.width = compositeCanvas.width
                bgCanvas.height = compositeCanvas.height
                const bgCtx = bgCanvas.getContext('2d')
                
                // Applique le gradient
                // Parse le background pour extraire les couleurs
                const bgElement = document.querySelector('.background-gradient')
                const computedStyle = window.getComputedStyle(bgElement)
                
                // Récupère le background-color de base (noir)
                bgCtx.fillStyle = '#171617'
                bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)
                
                // Note: Pour un vrai gradient CSS, il faudrait le parser
                // ou utiliser une couleur unie de fallback
                ctx.drawImage(bgCanvas, 0, 0)
            } else {
                // Fallback : fond noir
                ctx.fillStyle = '#171617'
                ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height)
            }
            
            // 2. Dessine le canvas Three.js par-dessus
            ctx.drawImage(threeCanvas, 0, 0)
            
            // 🆕 Effet de flash AVANT de sauvegarder
            await this.flashEffect()
            
            // Convertit en blob PNG
            const blob = await new Promise((resolve) => {
                compositeCanvas.toBlob(resolve, 'image/png', 1.0)
            })
            
            // Crée un nom de fichier avec timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
            const filename = `rl-viewer-${timestamp}.png`
            
            // Télécharge l'image
            this.downloadBlob(blob, filename)
            
            console.log('✅ Image saved with background:', filename)
            
            return true
        } catch (error) {
            console.error('❌ Error capturing image:', error)
            return false
        } finally {
            // Réaffiche l'UI
            this.showUI()
        }
    }
    
    /**
     * Démarre l'enregistrement vidéo
     */
    async startRecording() {
        if (this.isRecording) {
            console.warn('⚠️ Already recording!')
            return false
        }
        
        console.log('🎥 Starting video recording...')
        
        // Cache l'UI
        this.hideUI()
        
        try {
            const canvas = this.renderer.instance.domElement
            
            // Crée un stream depuis le canvas
            const stream = canvas.captureStream(60) // 60 FPS
            
            // Configure le MediaRecorder (API native du navigateur)
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 8000000 // 8 Mbps pour bonne qualité
            }
            
            // Fallback si VP9 n'est pas supporté
            if (!window.MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8'
            }
            
            this.recorder = new window.MediaRecorder(stream, options)
            this.recordedChunks = []
            
            // Collecte les chunks
            this.recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data)
                }
            }
            
            // Quand l'enregistrement s'arrête
            this.recorder.onstop = () => {
                this.saveRecording()
            }
            
            // Démarre l'enregistrement
            this.recorder.start()
            this.isRecording = true
            
            console.log('✅ Recording started!')
            return true
            
        } catch (error) {
            console.error('❌ Error starting recording:', error)
            this.showUI()
            return false
        }
    }
    
    /**
     * Arrête l'enregistrement vidéo
     */
    stopRecording() {
        if (!this.isRecording || !this.recorder) {
            console.warn('⚠️ Not recording!')
            return false
        }
        
        console.log('⏹️ Stopping recording...')
        
        this.recorder.stop()
        this.isRecording = false
        
        // Réaffiche l'UI
        this.showUI()
        
        return true
    }
    
    /**
     * Sauvegarde l'enregistrement vidéo
     */
    saveRecording() {
        console.log('💾 Saving video...')
        
        try {
            // Crée un blob depuis les chunks
            const blob = new Blob(this.recordedChunks, {
                type: 'video/webm'
            })
            
            // Crée un nom de fichier avec timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
            const filename = `rl-viewer-${timestamp}.webm`
            
            // Télécharge la vidéo
            this.downloadBlob(blob, filename)
            
            console.log('✅ Video saved:', filename)
            
            // Nettoie
            this.recordedChunks = []
            this.recorder = null
            
        } catch (error) {
            console.error('❌ Error saving video:', error)
        }
    }
    
    /**
     * Télécharge un blob
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        
        // Libère l'URL après un court délai
        setTimeout(() => URL.revokeObjectURL(url), 100)
    }
    
    /**
     * Enregistre une animation complète
     * @param {Function} animationFunction - Fonction qui retourne une Promise d'animation
     * @param {Number} duration - Durée estimée en ms (optionnel)
     */
    async recordAnimation(animationFunction, duration = null) {
        console.log('🎬 Recording animation...')
        
        // Démarre l'enregistrement
        const started = await this.startRecording()
        if (!started) return false
        
        try {
            // Lance l'animation
            await animationFunction()
            
            // Si pas de durée spécifiée, attend un peu après l'animation
            if (!duration) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
            
            // Arrête l'enregistrement
            this.stopRecording()
            
            console.log('✅ Animation recorded!')
            return true
            
        } catch (error) {
            console.error('❌ Error recording animation:', error)
            this.stopRecording()
            return false
        }
    }
}
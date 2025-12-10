import * as THREE from 'three'

export default class CustomTextureManager {
    constructor(resources, textureStorage) {
        this.resources = resources
        this.textureStorage = textureStorage
        this.prefix = 'customBody_'
    }
    
    /**
     * Charge et stocke une texture custom depuis un fichier
     */
    async loadFromFile(carType, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            
            reader.onload = (e) => {
                const dataURL = e.target.result
                const textureLoader = new THREE.TextureLoader()
                
                textureLoader.load(
                    dataURL,
                    (texture) => {
                        // Configure la texture
                        texture.flipY = false
                        texture.colorSpace = THREE.SRGBColorSpace
                        texture.needsUpdate = true
                        
                        // Stocke dans resources
                        const key = this.prefix + carType
                        this.resources.items[key] = texture
                        
                        // Sauvegarde le dataURL dans storage
                        this.textureStorage.saveTexture(carType, dataURL)
                        
                        console.log(`✅ Custom texture loaded and stored for ${carType}`)
                        resolve(texture)
                    },
                    undefined,
                    reject
                )
            }
            
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }
    
    /**
     * Récupère une texture custom depuis resources
     */
    getTexture(carType) {
        const key = this.prefix + carType
        return this.resources.items[key] || null
    }
    
    /**
     * Supprime une texture custom
     */
    removeTexture(carType) {
        const key = this.prefix + carType
        
        // Dispose la texture
        if(this.resources.items[key]) {
            this.resources.items[key].dispose()
            delete this.resources.items[key]
        }
        
        // Supprime du storage
        this.textureStorage.removeTexture(carType)
        
        console.log(`✅ Custom texture removed for ${carType}`)
    }
    
    /**
     * Charge toutes les textures stockées au démarrage
     */
    async loadAllStored() {
        const stored = this.textureStorage.getAllTextures()
        const promises = []
        
        for(const [carType, dataURL] of Object.entries(stored)) {
            const promise = new Promise((resolve) => {
                const textureLoader = new THREE.TextureLoader()
                
                textureLoader.load(
                    dataURL,
                    (texture) => {
                        texture.flipY = false
                        texture.colorSpace = THREE.SRGBColorSpace
                        texture.needsUpdate = true
                        
                        const key = this.prefix + carType
                        this.resources.items[key] = texture
                        
                        console.log(`✅ Restored texture for ${carType}`)
                        resolve()
                    },
                    undefined,
                    () => {
                        console.warn(`⚠️ Failed to restore texture for ${carType}`)
                        this.textureStorage.removeTexture(carType)
                        resolve()
                    }
                )
            })
            
            promises.push(promise)
        }
        
        await Promise.all(promises)
        console.log(`✅ All stored textures loaded (${promises.length} total)`)
    }
}
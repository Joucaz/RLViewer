export default class TextureStorage {
    constructor() {
        this.storageKey = 'rl_custom_textures'        
    }
    
    // Sauvegarde une texture pour un type de voiture
    saveTexture(carType, imageDataURL) {
        try {
            const storage = this.getAllTextures()
            storage[carType] = imageDataURL
            sessionStorage.setItem(this.storageKey, JSON.stringify(storage))
            console.log(`✅ Texture saved for ${carType}`)
            return true
        } catch (error) {
            console.error('❌ Error saving texture:', error)
            return false
        }
    }
    
    // Récupère la texture pour un type de voiture
    getTexture(carType) {
        try {
            const storage = this.getAllTextures()
            return storage[carType] || null
        } catch (error) {
            console.error('❌ Error loading texture:', error)
            return null
        }
    }
    
    // Supprime la texture pour un type de voiture
    removeTexture(carType) {
        try {
            const storage = this.getAllTextures()
            delete storage[carType]
            sessionStorage.setItem(this.storageKey, JSON.stringify(storage))
            console.log(`✅ Texture removed for ${carType}`)
            return true
        } catch (error) {
            console.error('❌ Error removing texture:', error)
            return false
        }
    }
    
    // Récupère toutes les textures
    getAllTextures() {
        try {
            const data = sessionStorage.getItem(this.storageKey)
            return data ? JSON.parse(data) : {}
        } catch (error) {
            console.error('❌ Error reading storage:', error)
            return {}
        }
    }
    
    // Efface toutes les textures
    clearAll() {
        try {
            sessionStorage.removeItem(this.storageKey)
            console.log('✅ All textures cleared')
            return true
        } catch (error) {
            console.error('❌ Error clearing storage:', error)
            return false
        }
    }
}
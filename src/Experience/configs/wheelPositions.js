export const wheelPositions = {
    fennec: {
        frontLeft: { 
            position: [-0.5, 0.2, -0.8], 
            scale: 1.0, 
            rotation: [0, 0, 0] 
        },
        frontRight: { 
            position: [0.5, 0.2, 0.8], 
            scale: 1.0, 
            rotation: [0, Math.PI, 0] // Miroir pour la roue droite
        },
        backgroundLeft: { 
            position: [-0.399172, 0.120685, -0.302589], 
            scale: -0.843494, 
            rotation: [-Math.PI, 0, 0] 
        },
        backgroundRight: { 
            position: [0.5, 0.2, -0.8], 
            scale: 1.0, 
            rotation: [0, Math.PI, 0] 
        }
    },
    octane: {
        frontLeft: { 
            position: [-0.45, 0.18, 0.75], 
            scale: 0.95, 
            rotation: [0, 0, 0] 
        },
        frontRight: { 
            position: [0.45, 0.18, 0.75], 
            scale: 0.95, 
            rotation: [0, Math.PI, 0] 
        },
        backgroundLeft: { 
            position: [-0.45, 0.18, -0.75], 
            scale: 0.95, 
            rotation: [0, 0, 0] 
        },
        backgroundRight: { 
            position: [0.45, 0.18, -0.75], 
            scale: 0.95, 
            rotation: [0, Math.PI, 0] 
        }
    },
    dominus: {
        frontLeft: { 
            position: [-0.6, 0.15, 0.9], 
            scale: 1.1, 
            rotation: [0, 0, 0] 
        },
        frontRight: { 
            position: [0.6, 0.15, 0.9], 
            scale: 1.1, 
            rotation: [0, Math.PI, 0] 
        },
        backgroundLeft: { 
            position: [-0.6, 0.15, -0.9], 
            scale: 1.1, 
            rotation: [0, 0, 0] 
        },
        backgroundRight: { 
            position: [0.6, 0.15, -0.9], 
            scale: 1.1, 
            rotation: [0, Math.PI, 0] 
        }
    }
}

// Optionnel : Config pour les différents types de roues
export const wheelTypeConfigs = {
    wheel_type1: {
        rotationSpeed: 2.0,
        name: 'Standard Wheels'
    },
    wheel_type2: {
        rotationSpeed: 2.5,
        name: 'Sport Wheels'
    },
    wheel_type3: {
        rotationSpeed: 1.8,
        name: 'Off-road Wheels'
    }
}
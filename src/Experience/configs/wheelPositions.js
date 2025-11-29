export const wheelPositions = {
    fennec: {
        frontLeft: { 
            position: [0.453933, 0.13, -0.299628], 
            scale: [-0.774238, -0.774238, -0.764238], 
            rotation: [0, 0, 0] 
        },
        frontRight: { 
            position: [0.453933, 0.13, 0.299628], 
            scale: [-0.774238, -0.774238, -0.764238], 
            rotation: [-Math.PI, 0, 0] 
        },
        backgroundLeft: { 
            position: [-0.399172, 0.145, -0.302589], 
            scale: [-0.843494, -0.843494, -0.823494], 
            rotation: [0, 0, 0] 
        },
        backgroundRight: { 
            position: [-0.398327, 0.145, 0.303634], 
            scale: [-0.843494, -0.843494, -0.823494], 
            rotation: [Math.PI, 0, 0] 
        }
    },
    octane: {
        frontLeft: { 
            position: [0.448, 0.125, -0.28], 
            scale: [-0.764238, -0.764238, -0.734238], 
            rotation: [0, 0, 0] 
        },
        frontRight: { 
            position: [0.448, 0.125, 0.28], 
            scale: [-0.764238, -0.764238, -0.734238], 
            rotation: [Math.PI, 0, 0] 
        },
        backgroundLeft: { 
            position: [-0.399508, 0.147, -0.317226], 
            scale: [-0.877088, -0.877088, -0.847088], 
            rotation: [0, 0, 0] 
        },
        backgroundRight: { 
            position: [-0.399508, 0.147, 0.317226], 
            scale: [-0.877088, -0.877088, -0.847088], 
            rotation: [Math.PI, 0, 0] 
        }
    },
    dominus: {
        frontLeft: { 
            position: [0.418662, 0.13, -0.315336], 
            scale: [0.780, 0.780, 0.8], 
            rotation: [Math.PI, 0, 0] 
        },
        frontRight: { 
            position: [0.418662, 0.13, 0.315336], 
            scale: [0.780, 0.780, 0.8], 
            rotation: [0, 0, 0] 
        },
        backgroundLeft: { 
            position: [-0.436358, 0.143, -0.325832], 
            scale: [0.871, 0.871, 0.901], 
            rotation: [Math.PI, 0, 0] 
        },
        backgroundRight: { 
            position: [-0.436358, 0.143, 0.325832], 
            scale: [0.871, 0.871, 0.901], 
            rotation: [0, 0, 0] 
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
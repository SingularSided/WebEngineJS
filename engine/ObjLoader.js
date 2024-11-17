export class ObjLoader {
    static parse(objData) {
        const vertices = [];
        const normals = [];
        const textureCoords = [];
        const vertexBuffer = [];
        const normalBuffer = [];
        const uvBuffer = [];
        const indices = [];

        const lines = objData.split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const type = parts[0];

            if (type === 'v') {
                vertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vn') {
                normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vt') {
                textureCoords.push([parseFloat(parts[1]), parseFloat(parts[2])]);
            } else if (type === 'f') {
                const faceVertices = parts.slice(1).map(face => {
                    const [vIndex, uvIndex, nIndex] = face.split('/').map(i => (i ? parseInt(i, 10) - 1 : null));

                    // Handle vertex positions
                    if (vIndex !== null) vertexBuffer.push(...vertices[vIndex]);

                    // Handle texture coordinates (validate index)
                    if (uvIndex !== null && textureCoords[uvIndex]) {
                        uvBuffer.push(...textureCoords[uvIndex]);
                    } else {
                        uvBuffer.push(0, 0); // Default UV
                    }

                    // Handle normals (validate index)
                    if (nIndex !== null && normals[nIndex]) {
                        normalBuffer.push(...normals[nIndex]);
                    } else {
                        normalBuffer.push(0, 0, 0); // Default normal
                    }

                    return vertexBuffer.length / 3 - 1; // Current index in vertex buffer
                });

                // Triangulate the face
                for (let i = 1; i < faceVertices.length - 1; i++) {
                    indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                }
            }
        });

        return {
            vertices: new Float32Array(vertexBuffer),
            normals: new Float32Array(normalBuffer),
            textureCoords: new Float32Array(uvBuffer),
            indices: new Uint16Array(indices),
        };
    }
}

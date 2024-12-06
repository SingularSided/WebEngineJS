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
                // Add vertex position
                const vertex = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
                vertices.push(vertex);
            } else if (type === 'vn') {
                // Add normal
                const normal = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
                normals.push(normal);
            } else if (type === 'vt') {
                // Add texture coordinate
                const uv = [parseFloat(parts[1]), parseFloat(parts[2])];
                textureCoords.push(uv);
            } else if (type === 'f') {
                // Parse face indices
                const faceVertices = parts.slice(1).map(face => {
                    const [vIndex, uvIndex, nIndex] = face.split('/').map(i => (i ? parseInt(i, 10) - 1 : null));

                    // Add vertex position to buffer
                    if (vIndex !== null) {
                        vertexBuffer.push(...vertices[vIndex]);
                    }

                    // Add texture coordinate to buffer
                    if (uvIndex !== null && textureCoords[uvIndex]) {
                        uvBuffer.push(...textureCoords[uvIndex]);
                    } else {
                        uvBuffer.push(0, 0); // Fallback to (0, 0) if no texture coordinate
                    }

                    // Add normal to buffer
                    if (nIndex !== null && normals[nIndex]) {
                        normalBuffer.push(...normals[nIndex]);
                    } else {
                        normalBuffer.push(0, 0, 0); // Fallback to (0, 0, 0) if no normal
                    }

                    return vertexBuffer.length / 3 - 1; // Return index of the last added vertex
                });

                // Create triangle indices
                for (let i = 1; i < faceVertices.length - 1; i++) {
                    indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                }
            }
        });



        return {
            vertices: new Float32Array(vertexBuffer),
            normals: new Float32Array(normalBuffer),
            texCoords: new Float32Array(uvBuffer), // Fix: Ensure this matches the property name expected by the Entity class
            indices: new Uint16Array(indices),
        };
    }
}

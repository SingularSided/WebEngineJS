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
                console.log(`Parsed Vertex: ${vertex}`);
            } else if (type === 'vn') {
                // Add normal
                const normal = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
                normals.push(normal);
                console.log(`Parsed Normal: ${normal}`);
            } else if (type === 'vt') {
                // Add texture coordinate
                const uv = [parseFloat(parts[1]), parseFloat(parts[2])];
                textureCoords.push(uv);
                console.log(`Parsed Texture Coordinate: ${uv}`);
            } else if (type === 'f') {
                // Parse face indices
                console.log(`Parsing Face Line: ${line}`);
                const faceVertices = parts.slice(1).map(face => {
                    const [vIndex, uvIndex, nIndex] = face.split('/').map(i => (i ? parseInt(i, 10) - 1 : null));
                    console.log(`Face Vertex: vIndex=${vIndex}, uvIndex=${uvIndex}, nIndex=${nIndex}`);

                    // Add vertex position to buffer
                    if (vIndex !== null) {
                        vertexBuffer.push(...vertices[vIndex]);
                        console.log(`Added Vertex to Buffer: ${vertices[vIndex]}`);
                    }

                    // Add texture coordinate to buffer
                    if (uvIndex !== null && textureCoords[uvIndex]) {
                        uvBuffer.push(...textureCoords[uvIndex]);
                        console.log(`Added Texture Coordinate to Buffer: ${textureCoords[uvIndex]}`);
                    } else {
                        uvBuffer.push(0, 0); // Fallback to (0, 0) if no texture coordinate
                        console.log(`Added Default Texture Coordinate: [0, 0]`);
                    }

                    // Add normal to buffer
                    if (nIndex !== null && normals[nIndex]) {
                        normalBuffer.push(...normals[nIndex]);
                        console.log(`Added Normal to Buffer: ${normals[nIndex]}`);
                    } else {
                        normalBuffer.push(0, 0, 0); // Fallback to (0, 0, 0) if no normal
                        console.log(`Added Default Normal: [0, 0, 0]`);
                    }

                    return vertexBuffer.length / 3 - 1; // Return index of the last added vertex
                });

                // Create triangle indices
                for (let i = 1; i < faceVertices.length - 1; i++) {
                    indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                    console.log(`Added Indices: [${faceVertices[0]}, ${faceVertices[i]}, ${faceVertices[i + 1]}]`);
                }
            }
        });

        console.log(`Final Buffers:`);
        console.log(`Vertex Buffer:`, vertexBuffer);
        console.log(`Normal Buffer:`, normalBuffer);
        console.log(`Texture Coordinate Buffer:`, uvBuffer);
        console.log(`Indices:`, indices);

        return {
            vertices: new Float32Array(vertexBuffer),
            normals: new Float32Array(normalBuffer),
            texCoords: new Float32Array(uvBuffer), // Fix: Ensure this matches the property name expected by the Entity class
            indices: new Uint16Array(indices),
        };
    }
}

import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, "../public");
const outputPath = path.join(outputDir, "3dmodel.glb");

const width = 0.38;
const height = 0.6;
const depth = 0.22;

const faces = [
    {
        normal: [0, 0, 1],
        corners: [
            [-width, -height, depth],
            [width, -height, depth],
            [width, height, depth],
            [-width, height, depth],
        ],
    },
    {
        normal: [0, 0, -1],
        corners: [
            [-width, -height, -depth],
            [-width, height, -depth],
            [width, height, -depth],
            [width, -height, -depth],
        ],
    },
    {
        normal: [-1, 0, 0],
        corners: [
            [-width, -height, -depth],
            [-width, -height, depth],
            [-width, height, depth],
            [-width, height, -depth],
        ],
    },
    {
        normal: [1, 0, 0],
        corners: [
            [width, -height, -depth],
            [width, height, -depth],
            [width, height, depth],
            [width, -height, depth],
        ],
    },
    {
        normal: [0, 1, 0],
        corners: [
            [-width, height, -depth],
            [-width, height, depth],
            [width, height, depth],
            [width, height, -depth],
        ],
    },
    {
        normal: [0, -1, 0],
        corners: [
            [-width, -height, -depth],
            [width, -height, -depth],
            [width, -height, depth],
            [-width, -height, depth],
        ],
    },
];

const positions = [];
const normals = [];

for (const face of faces) {
    const [a, b, c, d] = face.corners;
    pushTriangle(a, b, c, face.normal);
    pushTriangle(a, c, d, face.normal);
}

function pushTriangle(v1, v2, v3, normal) {
    positions.push(...v1, ...v2, ...v3);
    normals.push(...normal, ...normal, ...normal);
}

const positionsArray = new Float32Array(positions);
const normalsArray = new Float32Array(normals);

const positionByteLength = positionsArray.byteLength;
const normalByteLength = normalsArray.byteLength;

const binBuffer = Buffer.concat([
    Buffer.from(positionsArray.buffer),
    Buffer.from(normalsArray.buffer),
]);

const binPadding = (4 - (binBuffer.length % 4)) % 4;
const binChunk = Buffer.concat([binBuffer, Buffer.alloc(binPadding)]);

const json = {
    asset: {
        version: "2.0",
        generator: "StickerLab-GLB",
    },
    scenes: [{ nodes: [0] }],
    nodes: [
        {
            mesh: 0,
            name: "MegaMiuFigurine",
        },
    ],
    materials: [
        {
            name: "MegaMiuCoat",
            pbrMetallicRoughness: {
                baseColorFactor: [0.46, 0.72, 0.99, 1],
                metallicFactor: 0,
                roughnessFactor: 0.45,
            },
        },
    ],
    meshes: [
        {
            name: "LowpolyCapsule",
            primitives: [
                {
                    attributes: {
                        POSITION: 0,
                        NORMAL: 1,
                    },
                    material: 0,
                    mode: 4,
                },
            ],
        },
    ],
    buffers: [
        {
            byteLength: positionByteLength + normalByteLength,
        },
    ],
    bufferViews: [
        {
            buffer: 0,
            byteOffset: 0,
            byteLength: positionByteLength,
            target: 34962,
        },
        {
            buffer: 0,
            byteOffset: positionByteLength,
            byteLength: normalByteLength,
            target: 34962,
        },
    ],
    accessors: [
        {
            bufferView: 0,
            componentType: 5126,
            count: positionsArray.length / 3,
            type: "VEC3",
            min: [-width, -height, -depth],
            max: [width, height, depth],
        },
        {
            bufferView: 1,
            componentType: 5126,
            count: normalsArray.length / 3,
            type: "VEC3",
        },
    ],
};

const jsonString = JSON.stringify(json);
const jsonPadding = (4 - (jsonString.length % 4)) % 4;
const jsonChunk = Buffer.from(jsonString + " ".repeat(jsonPadding));

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonChunk.length, 0);
jsonHeader.write("JSON", 4, "ascii");

const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binChunk.length, 0);
binHeader.write("BIN\0", 4, "ascii");

const header = Buffer.alloc(12);
header.write("glTF", 0, "ascii");
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + jsonHeader.length + jsonChunk.length + binHeader.length + binChunk.length, 8);

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]));

console.log(`Generated default GLB at ${outputPath}`);

import { _decorator, Component, } from 'cc';
import { MapObjectType } from './GameMap';
import { Coordinate } from './GameObject';
const { ccclass, property } = _decorator;

type NodeDat = {
    x: number;
    y: number;
    g: number; // 从起点到该点的代价
    h: number; // 启发式代价（估算到终点的代价）
    f: number; // g + h
    parent?: NodeDat;
};

@ccclass('AStar')
export class AStar {
    static CalculateRoad(mapDat: number[][], start: Coordinate, end: Coordinate): Coordinate[] {
        const openList: NodeDat[] = [];
        const closedList: boolean[][] = mapDat.map(row => row.map(() => false));

        const rows = mapDat.length;
        const cols = mapDat[0].length;

        const heuristic = (x: number, y: number) => {
            return Math.abs(x - end[0]) + Math.abs(y - end[1]); // 曼哈顿距离
        };

        const getNeighbors = (node: NodeDat): NodeDat[] => {
            const dirs = [
                [0, -1], [0, 1], [-1, 0], [1, 0]
            ];
            const neighbors: NodeDat[] = [];

            for (const [dx, dy] of dirs) {
                const nx = node.x + dx;
                const ny = node.y + dy;

                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && mapDat[ny][nx] === MapObjectType.ROAD && !closedList[ny][nx]) {
                    neighbors.push({
                        x: nx,
                        y: ny,
                        g: node.g + 1,
                        h: heuristic(nx, ny),
                        f: 0,
                        parent: node
                    });
                }
            }

            return neighbors;
        };

        const startNode: NodeDat = {
            x: start.x,
            y: start.y,
            g: 0,
            h: heuristic(start.x, start.y),
            f: 0
        };
        startNode.f = startNode.g + startNode.h;
        openList.push(startNode);

        while (openList.length > 0) {
            // 按 f 值排序，取出最小的
            openList.sort((a, b) => a.f - b.f);
            const current = openList.shift()!;
            closedList[current.y][current.x] = true;

            if (current.x === end.x && current.y === end.y) {
                // 找到路径
                const path: Coordinate[] = [];
                let node: NodeDat = current;
                while (node) {
                    path.push({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path.reverse();
            }

            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                neighbor.f = neighbor.g + neighbor.h;

                const existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (!existing || neighbor.g < existing.g) {
                    openList.push(neighbor);
                }
            }
        }

        // 没有路径
        return null;
    }
}



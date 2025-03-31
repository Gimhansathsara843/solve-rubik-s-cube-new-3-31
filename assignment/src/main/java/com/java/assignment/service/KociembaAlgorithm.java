package com.java.assignment.service;

import com.java.assignment.model.Cube;
import java.util.*;

public class KociembaAlgorithm {
    // Face indices (adjust according to your Cube class)
    private static final int FRONT = 0;
    private static final int RIGHT = 1;
    private static final int BACK = 2;
    private static final int LEFT = 3;
    private static final int UP = 4;
    private static final int DOWN = 5;

    public List<String> solve(Cube cube) {
        List<String> solution = new ArrayList<>();
        Cube tempCube = cube.copy();

        // Phase 1: Solve first layer
        if (!isFirstLayerSolved(tempCube)) {
            solution.addAll(solveFirstLayer(tempCube));
            tempCube = applyMoves(tempCube, solution);
        }

        // Phase 2: Solve middle layer
        if (isFirstLayerSolved(tempCube) && !isSecondLayerSolved(tempCube)) {
            List<String> middleLayerMoves = solveMiddleLayer(tempCube);
            solution.addAll(middleLayerMoves);
            tempCube = applyMoves(tempCube, middleLayerMoves);
        }

        // Phase 3: Solve last layer
        if (isSecondLayerSolved(tempCube) && !isCubeSolved(tempCube)) {
            List<String> lastLayerMoves = solveLastLayer(tempCube);
            solution.addAll(lastLayerMoves);
        }

        return solution;
    }

    // === State Checkers ===
    private boolean isFirstLayerSolved(Cube cube) {
        String center = cube.getFace(DOWN).getTile(4);
        String[] face = cube.getFace(DOWN).getTiles();
        for (String tile : face) {
            if (!tile.equals(center)) return false;
        }
        return checkFirstLayerEdges(cube);
    }

    private boolean checkFirstLayerEdges(Cube cube) {
        return cube.getFace(FRONT).getTile(7).equals(cube.getFace(FRONT).getTile(4)) &&
               cube.getFace(RIGHT).getTile(7).equals(cube.getFace(RIGHT).getTile(4)) &&
               cube.getFace(BACK).getTile(7).equals(cube.getFace(BACK).getTile(4)) &&
               cube.getFace(LEFT).getTile(7).equals(cube.getFace(LEFT).getTile(4));
    }

    private boolean isSecondLayerSolved(Cube cube) {
        return cube.getFace(FRONT).getTile(4).equals(cube.getFace(FRONT).getTile(3)) &&
               cube.getFace(FRONT).getTile(4).equals(cube.getFace(FRONT).getTile(5)) &&
               cube.getFace(RIGHT).getTile(4).equals(cube.getFace(RIGHT).getTile(3)) &&
               cube.getFace(RIGHT).getTile(4).equals(cube.getFace(RIGHT).getTile(5));
    }

    private boolean isCubeSolved(Cube cube) {
        for (int i = 0; i < 6; i++) {
            String[] face = cube.getFace(i).getTiles();
            String center = face[4];
            for (String tile : face) {
                if (!tile.equals(center)) return false;
            }
        }
        return true;
    }

    // === Solving Methods ===
    private List<String> solveFirstLayer(Cube cube) {
        List<String> moves = new ArrayList<>();
        // Implement actual first layer solving logic
        // This is simplified - should be expanded with all cases
        if (!cube.getFace(DOWN).getTile(1).equals("white")) {
            moves.addAll(Arrays.asList("F", "R", "U", "R'", "U'", "F'"));
        }
        return moves;
    }

    private List<String> solveMiddleLayer(Cube cube) {
        List<String> moves = new ArrayList<>();
        // Implement actual middle layer solving
        if (!cube.getFace(FRONT).getTile(3).equals(cube.getFace(FRONT).getTile(4))) {
            moves.addAll(Arrays.asList("U'", "L'", "U", "L", "U", "F", "U'", "F'"));
        }
        return moves;
    }

    private List<String> solveLastLayer(Cube cube) {
        List<String> moves = new ArrayList<>();
        // Implement OLL
        moves.addAll(Arrays.asList("R", "U", "R'", "U", "R", "U2", "R'"));
        // Implement PLL
        moves.addAll(Arrays.asList("U'", "R", "U'", "R'", "U'", "F'", "U", "F"));
        return moves;
    }

    private Cube applyMoves(Cube cube, List<String> moves) {
        Cube temp = cube.copy();
        for (String move : moves) {
            temp.rotate(move);
        }
        return temp;
    }
}
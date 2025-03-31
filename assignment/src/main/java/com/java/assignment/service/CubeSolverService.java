package com.java.assignment.service;

import com.java.assignment.model.Cube;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CubeSolverService {
    private final KociembaAlgorithm algorithm = new KociembaAlgorithm();

    public List solveCube(String[][] cubeFaces) {
        if (!CubeValidator.isValidCube(cubeFaces)) {
            throw new IllegalArgumentException("Invalid cube configuration");
        }
        if (!CubeValidator.isPhysicallyPossible(cubeFaces)) {
            throw new IllegalArgumentException("Physically impossible configuration");
        }
    
        validateCube(cubeFaces);
        Cube cube = convertToCube(cubeFaces);
        return algorithm.solve(cube);
    }

    private void validateCube(String[][] cubeFaces) {
        if (cubeFaces == null || cubeFaces.length != 6) {
            throw new IllegalArgumentException("Cube must have exactly 6 faces");
        }

        Map<String, Integer> colorCounts = new HashMap<>();
        Set centers = new HashSet<>();

        for (String[] face : cubeFaces) {
            if (face == null || face.length != 9) {
                throw new IllegalArgumentException("Each face must have 9 tiles");
            }
            centers.add(face[4]);
            for (String color : face) {
                colorCounts.put(color, colorCounts.getOrDefault(color, 0) + 1);
            }
        }

        if (centers.size() != 6) {
            throw new IllegalArgumentException("All center pieces must be unique");
        }

        for (int count : colorCounts.values().stream().mapToInt(Integer::intValue).toArray()) {
            if (count != 9) {
                throw new IllegalArgumentException("Each color must appear exactly 9 times");
            }
        }
    }

    private Cube convertToCube(String[][] cubeFaces) {
        Cube cube = new Cube();
        for (int i = 0; i < 6; i++) {
            cube.setFace(i, cubeFaces[i]);
        }
        return cube;
    }
}
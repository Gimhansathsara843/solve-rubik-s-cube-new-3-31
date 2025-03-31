package com.java.assignment.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class CubeValidator {
    private static final Set<String> STANDARD_COLORS_SET = new HashSet<>(Arrays.asList("white", "red", "blue", "green", "orange", "yellow"));

    public static boolean isValidCube(String[][] cubeFaces) {
        // Basic structure validation
        if (cubeFaces == null || cubeFaces.length != 6) {
            return false;
        }

        Set<String> centers = new HashSet<>();
        Map<String, Integer> colorCounts = new HashMap<>();
        for (String color : STANDARD_COLORS_SET) {
            colorCounts.put(color, 0);  // Initialize color counts
        }

        for (String[] face : cubeFaces) {
            // Face structure validation
            if (face == null || face.length != 9) {
                return false;
            }

            // Center validation
            String center = face[4];
            if (!STANDARD_COLORS_SET.contains(center)) {
                return false;
            }
            if (!centers.add(center)) {
                return false; // Duplicate center
            }

            // Color counts
            for (String color : face) {
                if (!STANDARD_COLORS_SET.contains(color)) {
                    return false; // Invalid color
                }
                colorCounts.put(color, colorCounts.get(color) + 1);
            }
        }

        // Verify all colors appear exactly 9 times
        for (Integer count : colorCounts.values()) {
            if (count != 9) {
                return false;
            }
        }

        return true;
    }

    public static boolean isPhysicallyPossible(String[][] cubeFaces) {
        if (!isValidCube(cubeFaces)) {
            return false;
        }

        // Placeholder for additional physical checks (e.g., corner, edge, adjacency, parity)
        return true; // Implement additional checks if needed
    }
}

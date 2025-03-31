package com.java.assignment.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CubeValidator {
    private static final List<String> STANDARD_COLORS = 
        Arrays.asList("white", "red", "blue", "green", "orange", "yellow");

    public static boolean isValidCube(String[][] cubeFaces) {
        // Basic structure validation
        if (cubeFaces == null || cubeFaces.length != 6) {
            return false;
        }

        Set<String> centers = new HashSet<>();
        int[] colorCounts = new int[STANDARD_COLORS.size()];

        for (String[] face : cubeFaces) {
            // Face structure validation
            if (face == null || face.length != 9) {
                return false;
            }

            // Center validation
            String center = face[4];
            if (!STANDARD_COLORS.contains(center)) {
                return false;
            }
            if (!centers.add(center)) {
                return false; // Duplicate center
            }

            // Color counts
            for (String color : face) {
                int colorIndex = STANDARD_COLORS.indexOf(color);
                if (colorIndex == -1) {
                    return false; // Invalid color
                }
                colorCounts[colorIndex]++;
            }
        }

        // Verify all colors appear exactly 9 times
        for (int count : colorCounts) {
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

        // Additional physical checks would go here:
        // - Corner piece validation (3 colors each)
        // - Edge piece validation (2 colors each)
        // - Color adjacency rules
        // - Parity checks

        return true; // Simplified - implement full checks
    }
}
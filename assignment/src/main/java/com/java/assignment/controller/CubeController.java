package com.java.assignment.controller;

import com.java.assignment.service.CubeSolverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// Your CubeController looks correct with:
@CrossOrigin(origins = "*") // Allows all origins
@RestController
@RequestMapping("/api/cube")
public class CubeController {
    private final CubeSolverService solverService;

    public CubeController(CubeSolverService solverService) {
        this.solverService = solverService;
    }

    @PostMapping("/solve")
    public ResponseEntity<?> solveCube(@RequestBody String[][] cubeFaces) {
        try {
            // Validate input structure
            if (cubeFaces == null || cubeFaces.length != 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error", "Invalid cube configuration",
                                "details", "Cube must have exactly 6 faces"
                        ));
            }

            // Validate each face
            for (String[] face : cubeFaces) {
                if (face == null || face.length != 9) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error", "Invalid face configuration",
                                    "details", "Each face must have exactly 9 tiles"
                            ));
                }
            }

            // Validate colors
            Map<String, Integer> colorCounts = new HashMap<>();
            Set<String> centers = new HashSet<>();
            Set<String> validColors = Set.of("white", "red", "blue", "green", "orange", "yellow");

            for (String[] face : cubeFaces) {
                String center = face[4];
                if (!validColors.contains(center)) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error", "Invalid center color",
                                    "details", "Center color must be one of: white, red, blue, green, orange, yellow"
                            ));
                }
                centers.add(center);

                for (String color : face) {
                    if (!validColors.contains(color)) {
                        return ResponseEntity.badRequest()
                                .body(Map.of(
                                        "error", "Invalid tile color",
                                        "details", "Colors must be one of: white, red, blue, green, orange, yellow"
                                ));
                    }
                    colorCounts.put(color, colorCounts.getOrDefault(color, 0) + 1);
                }
            }

            // Check center uniqueness
            if (centers.size() != 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error", "Invalid cube configuration",
                                "details", "All center pieces must be unique"
                        ));
            }

            // Check color counts (9 of each)
            for (String color : validColors) {
                if (colorCounts.getOrDefault(color, 0) != 9) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error", "Invalid cube configuration",
                                    "details", "Each color must appear exactly 9 times"
                            ));
                }
            }

            // Try to solve
            List<String> solution = solverService.solveCube(cubeFaces);
            return ResponseEntity.ok(Map.of(
                    "solution", solution,
                    "moveCount", solution.size(),
                    "status", "SOLVED"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", e.getMessage(),
                            "status", "INVALID_CUBE"
                    ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Solving failed",
                            "details", e.getMessage(),
                            "status", "ERROR"
                    ));
        }
    }

    @GetMapping("/scramble")
    public ResponseEntity<?> generateScramble(@RequestParam(defaultValue = "20") int length) {
        try {
            if (length < 1 || length > 50) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error", "Invalid scramble length",
                                "details", "Length must be between 1 and 50"
                        ));
            }

            List<String> scramble = generateRandomScramble(length);
            return ResponseEntity.ok(Map.of(
                    "scramble", scramble,
                    "length", scramble.size(),
                    "status", "GENERATED"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to generate scramble",
                            "details", e.getMessage(),
                            "status", "ERROR"
                    ));
        }
    }

    private List<String> generateRandomScramble(int length) {
        String[] moves = {"U", "D", "R", "L", "F", "B"};
        String[] modifiers = {"", "'", "2"};
        List<String> scramble = new ArrayList<>();
        Random random = new Random();

        String lastMove = "";
        for (int i = 0; i < length; i++) {
            String move;
            do {
                move = moves[random.nextInt(moves.length)];
            } while (move.equals(lastMove));

            lastMove = move;
            String modifier = modifiers[random.nextInt(modifiers.length)];
            scramble.add(move + modifier);
        }

        return scramble;
    }

    @GetMapping("/solved-state")
    public ResponseEntity<?> getSolvedState() {
        try {
            String[][] solvedState = {
                    // Front (red)
                    {"red", "red", "red", "red", "red", "red", "red", "red", "red"},
                    // Right (blue)
                    {"blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue"},
                    // Back (green)
                    {"green", "green", "green", "green", "green", "green", "green", "green", "green"},
                    // Left (orange)
                    {"orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"},
                    // Up (white)
                    {"white", "white", "white", "white", "white", "white", "white", "white", "white"},
                    // Down (yellow)
                    {"yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"}
            };

            return ResponseEntity.ok(Map.of(
                    "state", solvedState,
                    "status", "SOLVED_STATE"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to get solved state",
                            "details", e.getMessage(),
                            "status", "ERROR"
                    ));
        }
    }
}

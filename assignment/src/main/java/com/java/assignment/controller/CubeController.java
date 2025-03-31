package com.java.assignment.controller;

import com.java.assignment.service.CubeSolverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/cube")
@CrossOrigin(origins = "*")
public class CubeController {
    private final CubeSolverService solverService;

    public CubeController(CubeSolverService solverService) {
        this.solverService = solverService;
    }

    @PostMapping("/solve")
    public ResponseEntity<?> solveCube(@RequestBody String[][] cubeFaces) {
        try {
            List<String> solution = solverService.solveCube(cubeFaces);
            return ResponseEntity.ok(solution);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage(), "status", "INVALID_CUBE")
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Solving failed", "details", e.getMessage())
            );
        }
    }
}
package com.java.assignment.model;

import java.util.Arrays;

public class Cube {
    private CubeFace[] faces;

    public Cube() {
        faces = new CubeFace[6];
        // Initialize with default solved state
        String[] colors = {"white", "red", "blue", "green", "orange", "yellow"};
        for (int i = 0; i < 6; i++) {
            String[] faceColors = new String[9];
            Arrays.fill(faceColors, colors[i]);
            faces[i] = new CubeFace(faceColors);
        }
    }

    public void setFace(int index, String[] colors) {
        faces[index] = new CubeFace(colors);
    }

    public CubeFace getFace(int index) {
        return faces[index];
    }

    public Cube copy() {
        Cube newCube = new Cube();
        for (int i = 0; i < 6; i++) {
            newCube.setFace(i, this.faces[i].getTiles());
        }
        return newCube;
    }

    public void rotate(String move) {
        switch (move) {
            case "U": rotateFaceClockwise(4); break;
            case "U'": rotateFaceCounterClockwise(4); break;
            case "U2": rotateFace180(4); break;
            case "D": rotateFaceClockwise(5); break;
            case "D'": rotateFaceCounterClockwise(5); break;
            case "D2": rotateFace180(5); break;
            case "R": rotateFaceClockwise(1); break;
            case "R'": rotateFaceCounterClockwise(1); break;
            case "R2": rotateFace180(1); break;
            case "L": rotateFaceClockwise(3); break;
            case "L'": rotateFaceCounterClockwise(3); break;
            case "L2": rotateFace180(3); break;
            case "F": rotateFaceClockwise(0); break;
            case "F'": rotateFaceCounterClockwise(0); break;
            case "F2": rotateFace180(0); break;
            case "B": rotateFaceClockwise(2); break;
            case "B'": rotateFaceCounterClockwise(2); break;
            case "B2": rotateFace180(2); break;
        }
    }

    private void rotateFaceClockwise(int faceIndex) {
        String[] face = faces[faceIndex].getTiles();
        String[] rotated = {
            face[6], face[3], face[0],
            face[7], face[4], face[1],
            face[8], face[5], face[2]
        };
        faces[faceIndex] = new CubeFace(rotated);
    }

    private void rotateFaceCounterClockwise(int faceIndex) {
        String[] face = faces[faceIndex].getTiles();
        String[] rotated = {
            face[2], face[5], face[8],
            face[1], face[4], face[7],
            face[0], face[3], face[6]
        };
        faces[faceIndex] = new CubeFace(rotated);
    }

    private void rotateFace180(int faceIndex) {
        rotateFaceClockwise(faceIndex);
        rotateFaceClockwise(faceIndex);
    }
}
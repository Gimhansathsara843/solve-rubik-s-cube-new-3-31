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
            newCube.setFace(i, this.faces[i].getTiles().clone());
        }
        return newCube;
    }

    public void rotate(String move) {
        if (move == null || move.isEmpty()) return;
        
        char face = move.charAt(0);
        boolean clockwise = true;
        boolean doubleTurn = false;
        
        if (move.length() > 1) {
            if (move.charAt(1) == '\'') {
                clockwise = false;
            } else if (move.charAt(1) == '2') {
                doubleTurn = true;
            }
        }
        
        if (doubleTurn) {
            rotateFace(face, true);
            rotateFace(face, true);
        } else {
            rotateFace(face, clockwise);
        }
    }
    
    private void rotateFace(char face, boolean clockwise) {
        int faceIndex = getFaceIndex(face);
        if (faceIndex == -1) return;
        
        // Rotate the face itself
        String[] faceTiles = faces[faceIndex].getTiles();
        String[] rotated = new String[9];
        
        if (clockwise) {
            rotated[0] = faceTiles[6];
            rotated[1] = faceTiles[3];
            rotated[2] = faceTiles[0];
            rotated[3] = faceTiles[7];
            rotated[4] = faceTiles[4];
            rotated[5] = faceTiles[1];
            rotated[6] = faceTiles[8];
            rotated[7] = faceTiles[5];
            rotated[8] = faceTiles[2];
        } else {
            rotated[0] = faceTiles[2];
            rotated[1] = faceTiles[5];
            rotated[2] = faceTiles[8];
            rotated[3] = faceTiles[1];
            rotated[4] = faceTiles[4];
            rotated[5] = faceTiles[7];
            rotated[6] = faceTiles[0];
            rotated[7] = faceTiles[3];
            rotated[8] = faceTiles[6];
        }
        
        faces[faceIndex] = new CubeFace(rotated);
        
        // Rotate the adjacent edges
        rotateAdjacentEdges(face, clockwise);
    }
    
    private void rotateAdjacentEdges(char face, boolean clockwise) {
        switch (face) {
            case 'U':
                rotateUpEdges(clockwise);
                break;
            case 'D':
                rotateDownEdges(clockwise);
                break;
            case 'R':
                rotateRightEdges(clockwise);
                break;
            case 'L':
                rotateLeftEdges(clockwise);
                break;
            case 'F':
                rotateFrontEdges(clockwise);
                break;
            case 'B':
                rotateBackEdges(clockwise);
                break;
        }
    }
    
    private void rotateUpEdges(boolean clockwise) {
        String[] front = faces[0].getTiles();
        String[] right = faces[1].getTiles();
        String[] back = faces[2].getTiles();
        String[] left = faces[3].getTiles();
        
        String[] temp = Arrays.copyOf(front, 3);
        
        if (clockwise) {
            // Front -> Right -> Back -> Left -> Front
            System.arraycopy(left, 0, front, 0, 3);
            System.arraycopy(back, 0, left, 0, 3);
            System.arraycopy(right, 0, back, 0, 3);
            System.arraycopy(temp, 0, right, 0, 3);
        } else {
            // Front -> Left -> Back -> Right -> Front
            System.arraycopy(right, 0, front, 0, 3);
            System.arraycopy(back, 0, right, 0, 3);
            System.arraycopy(left, 0, back, 0, 3);
            System.arraycopy(temp, 0, left, 0, 3);
        }
        
        faces[0].setTiles(front);
        faces[1].setTiles(right);
        faces[2].setTiles(back);
        faces[3].setTiles(left);
    }
    
    private void rotateDownEdges(boolean clockwise) {
        String[] front = faces[0].getTiles();
        String[] right = faces[1].getTiles();
        String[] back = faces[2].getTiles();
        String[] left = faces[3].getTiles();
        
        String[] temp = Arrays.copyOfRange(front, 6, 9);
        
        if (clockwise) {
            // Front -> Left -> Back -> Right -> Front
            System.arraycopy(Arrays.copyOfRange(right, 6, 9), 0, front, 6, 3);
            System.arraycopy(Arrays.copyOfRange(back, 6, 9), 0, right, 6, 3);
            System.arraycopy(Arrays.copyOfRange(left, 6, 9), 0, back, 6, 3);
            System.arraycopy(temp, 0, left, 6, 3);
        } else {
            // Front -> Right -> Back -> Left -> Front
            System.arraycopy(Arrays.copyOfRange(left, 6, 9), 0, front, 6, 3);
            System.arraycopy(Arrays.copyOfRange(back, 6, 9), 0, left, 6, 3);
            System.arraycopy(Arrays.copyOfRange(right, 6, 9), 0, back, 6, 3);
            System.arraycopy(temp, 0, right, 6, 3);
        }
    }
    
    private void rotateRightEdges(boolean clockwise) {
        String[] front = faces[0].getTiles();
        String[] up = faces[4].getTiles();
        String[] back = faces[2].getTiles();
        String[] down = faces[5].getTiles();
        
        String[] temp = new String[] {
            front[2], front[5], front[8]
        };
        
        if (clockwise) {
            // Front -> Down -> Back -> Up -> Front
            front[2] = down[2];
            front[5] = down[5];
            front[8] = down[8];
            
            down[2] = back[6];
            down[5] = back[3];
            down[8] = back[0];
            
            back[6] = up[2];
            back[3] = up[5];
            back[0] = up[8];
            
            up[2] = temp[0];
            up[5] = temp[1];
            up[8] = temp[2];
        } else {
            // Front -> Up -> Back -> Down -> Front
            front[2] = up[2];
            front[5] = up[5];
            front[8] = up[8];
            
            up[2] = back[6];
            up[5] = back[3];
            up[8] = back[0];
            
            back[6] = down[2];
            back[3] = down[5];
            back[0] = down[8];
            
            down[2] = temp[0];
            down[5] = temp[1];
            down[8] = temp[2];
        }
    }
    
    private void rotateLeftEdges(boolean clockwise) {
        String[] front = faces[0].getTiles();
        String[] up = faces[4].getTiles();
        String[] back = faces[2].getTiles();
        String[] down = faces[5].getTiles();
        
        String[] temp = new String[] {
            front[0], front[3], front[6]
        };
        
        if (clockwise) {
            // Front -> Up -> Back -> Down -> Front
            front[0] = up[0];
            front[3] = up[3];
            front[6] = up[6];
            
            up[0] = back[8];
            up[3] = back[5];
            up[6] = back[2];
            
            back[8] = down[0];
            back[5] = down[3];
            back[2] = down[6];
            
            down[0] = temp[0];
            down[3] = temp[1];
            down[6] = temp[2];
        } else {
            // Front -> Down -> Back -> Up -> Front
            front[0] = down[0];
            front[3] = down[3];
            front[6] = down[6];
            
            down[0] = back[8];
            down[3] = back[5];
            down[6] = back[2];
            
            back[8] = up[0];
            back[5] = up[3];
            back[2] = up[6];
            
            up[0] = temp[0];
            up[3] = temp[1];
            up[6] = temp[2];
        }
    }
    
    private void rotateFrontEdges(boolean clockwise) {
        String[] up = faces[4].getTiles();
        String[] right = faces[1].getTiles();
        String[] down = faces[5].getTiles();
        String[] left = faces[3].getTiles();
        
        String[] temp = new String[] {
            up[6], up[7], up[8]
        };
        
        if (clockwise) {
            // Up -> Right -> Down -> Left -> Up
            up[6] = left[8];
            up[7] = left[5];
            up[8] = left[2];
            
            left[8] = down[2];
            left[5] = down[1];
            left[2] = down[0];
            
            down[2] = right[0];
            down[1] = right[3];
            down[0] = right[6];
            
            right[0] = temp[0];
            right[3] = temp[1];
            right[6] = temp[2];
        } else {
            // Up -> Left -> Down -> Right -> Up
            up[6] = right[0];
            up[7] = right[3];
            up[8] = right[6];
            
            right[0] = down[2];
            right[3] = down[1];
            right[6] = down[0];
            
            down[2] = left[8];
            down[1] = left[5];
            down[0] = left[2];
            
            left[8] = temp[0];
            left[5] = temp[1];
            left[2] = temp[2];
        }
    }
    
    private void rotateBackEdges(boolean clockwise) {
        String[] up = faces[4].getTiles();
        String[] right = faces[1].getTiles();
        String[] down = faces[5].getTiles();
        String[] left = faces[3].getTiles();
        
        String[] temp = new String[] {
            up[0], up[1], up[2]
        };
        
        if (clockwise) {
            // Up -> Left -> Down -> Right -> Up
            up[0] = right[2];
            up[1] = right[5];
            up[2] = right[8];
            
            right[2] = down[8];
            right[5] = down[7];
            right[8] = down[6];
            
            down[8] = left[6];
            down[7] = left[3];
            down[6] = left[0];
            
            left[6] = temp[0];
            left[3] = temp[1];
            left[0] = temp[2];
        } else {
            // Up -> Right -> Down -> Left -> Up
            up[0] = left[6];
            up[1] = left[3];
            up[2] = left[0];
            
            left[6] = down[8];
            left[3] = down[7];
            left[0] = down[6];
            
            down[8] = right[2];
            down[7] = right[5];
            down[6] = right[8];
            
            right[2] = temp[0];
            right[5] = temp[1];
            right[8] = temp[2];
        }
    }
    
    private int getFaceIndex(char face) {
        switch (face) {
            case 'F': return 0;
            case 'R': return 1;
            case 'B': return 2;
            case 'L': return 3;
            case 'U': return 4;
            case 'D': return 5;
            default: return -1;
        }
    }
    
    public String[][] getFacesAsArray() {
        String[][] result = new String[6][9];
        for (int i = 0; i < 6; i++) {
            result[i] = faces[i].getTiles().clone();
        }
        return result;
    }
}
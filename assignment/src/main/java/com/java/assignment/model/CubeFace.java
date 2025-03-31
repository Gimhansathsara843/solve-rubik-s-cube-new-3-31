package com.java.assignment.model;

public class CubeFace {
    private String[] tiles;

    public CubeFace(String[] colors) {
        if (colors.length != 9) {
            throw new IllegalArgumentException("A face must have exactly 9 tiles");
        }
        this.tiles = colors.clone();
    }

    public String getTile(int index) {
        if (index < 0 || index >= 9) {
            throw new IllegalArgumentException("Tile index must be between 0 and 8");
        }
        return tiles[index];
    }

    public void setTile(int index, String color) {
        if (index < 0 || index >= 9) {
            throw new IllegalArgumentException("Tile index must be between 0 and 8");
        }
        tiles[index] = color;
    }

    public String[] getTiles() {
        return tiles.clone();
    }
    
    public void setTiles(String[] tiles) {
        if (tiles.length != 9) {
            throw new IllegalArgumentException("A face must have exactly 9 tiles");
        }
        this.tiles = tiles.clone();
    }
}
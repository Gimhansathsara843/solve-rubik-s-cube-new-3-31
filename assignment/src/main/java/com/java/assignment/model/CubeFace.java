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
        return tiles[index];
    }

    public void setTile(int index, String color) {
        tiles[index] = color;
    }

    public String[] getTiles() {
        return tiles.clone();
    }
}
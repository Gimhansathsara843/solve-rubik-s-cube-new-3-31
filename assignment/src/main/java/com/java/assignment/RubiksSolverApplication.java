package com.java.assignment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class})
public class RubiksSolverApplication {
    public static void main(String[] args) {
        SpringApplication.run(RubiksSolverApplication.class, args);
    }
}

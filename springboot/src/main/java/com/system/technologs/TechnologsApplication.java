package com.system.technologs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TechnologsApplication {

	public static void main(String[] args) {
		SpringApplication.run(TechnologsApplication.class, args);
	}

}
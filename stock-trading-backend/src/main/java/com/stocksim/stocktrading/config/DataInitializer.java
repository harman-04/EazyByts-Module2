//package com.stocksim.stocktrading.config; // Or a suitable 'config' or 'util' package
//
//import com.stocksim.stocktrading.model.ERole;
//import com.stocksim.stocktrading.model.Role;
//import com.stocksim.stocktrading.repository.RoleRepository;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.util.Arrays;
//
//@Configuration
//public class DataInitializer {
//
//    @Bean
//    public CommandLineRunner initRoles(RoleRepository roleRepository) {
//        return args -> {
//            // Check if roles exist, if not, create them
//            if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
//                roleRepository.save(new Role(ERole.ROLE_USER));
//                System.out.println("ROLE_USER created.");
//            }
//            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
//                roleRepository.save(new Role(ERole.ROLE_ADMIN));
//                System.out.println("ROLE_ADMIN created.");
//            }
//            if (roleRepository.findByName(ERole.ROLE_MODERATOR).isEmpty()) {
//                roleRepository.save(new Role(ERole.ROLE_MODERATOR));
//                System.out.println("ROLE_MODERATOR created.");
//            }
//
//            // You can also loop through all ERole values
//            /*
//            Arrays.stream(ERole.values()).forEach(eRole -> {
//                if (roleRepository.findByName(eRole).isEmpty()) {
//                    roleRepository.save(new Role(eRole));
//                    System.out.println("Role " + eRole.name() + " created.");
//                }
//            });
//            */
//        };
//    }
//}
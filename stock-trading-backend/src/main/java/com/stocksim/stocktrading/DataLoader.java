package com.stocksim.stocktrading;

import com.stocksim.stocktrading.model.ERole;
import com.stocksim.stocktrading.model.Role;
import com.stocksim.stocktrading.model.Stock; // Import Stock model
import com.stocksim.stocktrading.repository.RoleRepository;
import com.stocksim.stocktrading.repository.StockRepository; // Import StockRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional; // Import Optional

/**
 DataLoader class to initialize necessary data in the database on application startup.
 This ensures that default roles like 'ROLE_USER' and initial stock data are present.
 */
@Component // Marks this class as a Spring component to be managed by the Spring container
public class DataLoader implements CommandLineRunner {

    @Autowired // Injects the RoleRepository to interact with the roles table
    private RoleRepository roleRepository;

    @Autowired // Injects the StockRepository to interact with the stocks table
    private StockRepository stockRepository;

    /**
     Callback used to run the bean.
     This method is executed once the application context is loaded.
     @param args command line arguments
     @throws Exception if an error occurs during execution
     */
    @Override
    public void run(String... args) throws Exception {
// --- Initialize Roles ---
        Optional userRoleOptional = roleRepository.findByName(ERole.ROLE_USER);
        if (userRoleOptional.isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            System.out.println("Initialized ROLE_USER in the database.");
        }

// Uncomment and add similar blocks if you have other roles like ADMIN or MODERATOR
/*
if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
roleRepository.save(new Role(ERole.ROLE_ADMIN));
System.out.println("Initialized ROLE_ADMIN in the database.");
}
if (roleRepository.findByName(ERole.ROLE_MODERATOR).isEmpty()) {
roleRepository.save(new Role(ERole.ROLE_MODERATOR));
System.out.println("Initialized ROLE_MODERATOR in the database.");
}
*/

// --- Initialize Stocks (Dummy Data) ---
// Add some dummy stocks if they don't already exist
        if (stockRepository.findBySymbol("AAPL").isEmpty()) {
            stockRepository.save(new Stock("AAPL", "Apple Inc.", new BigDecimal("170.50")));
            System.out.println("Initialized stock: AAPL");
        }
        if (stockRepository.findBySymbol("GOOGL").isEmpty()) {
            stockRepository.save(new Stock("GOOGL", "Alphabet Inc. (Class A)", new BigDecimal("1750.25")));
            System.out.println("Initialized stock: GOOGL");
        }
        if (stockRepository.findBySymbol("MSFT").isEmpty()) {
            stockRepository.save(new Stock("MSFT", "Microsoft Corp.", new BigDecimal("420.10")));
            System.out.println("Initialized stock: MSFT");
        }
        if (stockRepository.findBySymbol("AMZN").isEmpty()) {
            stockRepository.save(new Stock("AMZN", "Amazon.com Inc.", new BigDecimal("185.75")));
            System.out.println("Initialized stock: AMZN");
        }
        if (stockRepository.findBySymbol("TSLA").isEmpty()) {
            stockRepository.save(new Stock("TSLA", "Tesla Inc.", new BigDecimal("180.00")));
            System.out.println("Initialized stock: TSLA");
        }
        if (stockRepository.findBySymbol("NFLX").isEmpty()) {
            stockRepository.save(new Stock("NFLX", "Netflix Inc.", new BigDecimal("650.30")));
            System.out.println("Initialized stock: NFLX");
        }
    }
}
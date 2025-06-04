package com.stocksim.stocktrading.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**

 JPA Entity representing a user role.

 This table will store predefined roles like 'ROLE_USER'.
 */
@Entity
@Table(name = "roles") // Table name for roles
@Getter
@Setter
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing primary key
    private Integer id;

    @Enumerated(EnumType.STRING) // Store enum as String in DB (e.g., "ROLE_USER")
    @Column(length = 20) // Max length for the role name string
    private ERole name;

    /**

     Constructor for creating a Role object with a given ERole.

     @param name The ERole enum value.
     */
    public Role(ERole name) {
        this.name = name;
    }
}

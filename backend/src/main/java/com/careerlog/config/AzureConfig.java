package com.careerlog.config;

import com.azure.core.credential.TokenCredential;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.SecretClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("azure")
public class AzureConfig {

    @Value("${AZURE_STORAGE_ACCOUNT_NAME}")
    private String storageAccountName;

    @Value("${AZURE_STORAGE_ACCOUNT_KEY}")
    private String storageAccountKey;

    // optional – will be empty string if not set
    @Value("${AZURE_KEYVAULT_URI:}")
    private String keyVaultUri;

    @Bean
    public BlobServiceClient blobServiceClient() {
        return new BlobServiceClientBuilder()
                .endpoint(String.format("https://%s.blob.core.windows.net", storageAccountName))
                .credential(new DefaultAzureCredentialBuilder().build())
                .buildClient();
    }

    @Bean
    public TokenCredential tokenCredential() {
        return new DefaultAzureCredentialBuilder().build();
    }

//    @Bean
//    public SecretClient secretClient(TokenCredential tokenCredential) {
//        // Only create this bean if a Key Vault URI was provided
//        if (keyVaultUri == null || keyVaultUri.isBlank()) {
//            // You can either:
//            // 1) return null (not ideal), or
//            // 2) throw a clear exception, or
//            // 3) skip defining this bean.
//            //
//            // Easiest: don't use this bean anywhere yet, or guard its usage.
//            throw new IllegalStateException("AZURE_KEYVAULT_URI is not configured but SecretClient was requested.");
//        }
//
//        return new SecretClientBuilder()
//                .vaultUrl(keyVaultUri)
//                .credential(tokenCredential)
//                .buildClient();
//    }
}

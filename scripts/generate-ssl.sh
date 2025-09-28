#!/bin/bash

# SSL Certificate Generation Script for MyGuide
# This script generates SSL certificates for development and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DOMAIN=${1:-localhost}
ENVIRONMENT=${2:-development}
SSL_DIR="./ssl"
COUNTRY="DZ"
STATE="Algiers"
CITY="Algiers"
ORGANIZATION="MyGuide"
ORGANIZATIONAL_UNIT="IT Department"
EMAIL="admin@myguide.com"

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if OpenSSL is installed
check_openssl() {
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL is not installed. Please install OpenSSL and try again."
    fi
    log "OpenSSL is available ✓"
}

# Create SSL directory
create_ssl_directory() {
    mkdir -p "$SSL_DIR"
    log "Created SSL directory: $SSL_DIR"
}

# Generate CA certificate for development
generate_ca_cert() {
    log "Generating Certificate Authority (CA) certificate..."
    
    # Generate CA private key
    openssl genrsa -out "$SSL_DIR/ca.key" 4096
    
    # Generate CA certificate
    openssl req -new -x509 -days 365 -key "$SSL_DIR/ca.key" -out "$SSL_DIR/ca.crt" -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=MyGuide CA/emailAddress=$EMAIL"
    
    log "CA certificate generated successfully"
}

# Generate server certificate
generate_server_cert() {
    log "Generating server certificate for domain: $DOMAIN"
    
    # Generate server private key
    openssl genrsa -out "$SSL_DIR/$DOMAIN.key" 2048
    
    # Create certificate signing request
    openssl req -new -key "$SSL_DIR/$DOMAIN.key" -out "$SSL_DIR/$DOMAIN.csr" -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$DOMAIN/emailAddress=$EMAIL"
    
    # Create extensions file for SAN
    cat > "$SSL_DIR/$DOMAIN.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = www.$DOMAIN
DNS.3 = localhost
DNS.4 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

    if [ "$ENVIRONMENT" = "development" ]; then
        # Sign with CA for development
        openssl x509 -req -in "$SSL_DIR/$DOMAIN.csr" -CA "$SSL_DIR/ca.crt" -CAkey "$SSL_DIR/ca.key" -CAcreateserial -out "$SSL_DIR/$DOMAIN.crt" -days 365 -extensions v3_req -extfile "$SSL_DIR/$DOMAIN.ext"
    else
        # Self-signed for production template (replace with actual CA signing)
        openssl x509 -req -in "$SSL_DIR/$DOMAIN.csr" -signkey "$SSL_DIR/$DOMAIN.key" -out "$SSL_DIR/$DOMAIN.crt" -days 365 -extensions v3_req -extfile "$SSL_DIR/$DOMAIN.ext"
        warn "Generated self-signed certificate. For production, use a proper CA like Let's Encrypt."
    fi
    
    log "Server certificate generated successfully"
}

# Generate DH parameters
generate_dhparam() {
    log "Generating Diffie-Hellman parameters (this may take a while)..."
    openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
    log "DH parameters generated successfully"
}

# Set proper permissions
set_permissions() {
    log "Setting proper permissions for SSL files..."
    chmod 600 "$SSL_DIR"/*.key
    chmod 644 "$SSL_DIR"/*.crt
    chmod 644 "$SSL_DIR"/*.pem
    log "Permissions set successfully"
}

# Generate Let's Encrypt certificate (production)
generate_letsencrypt() {
    log "Setting up Let's Encrypt certificate for domain: $DOMAIN"
    
    if ! command -v certbot &> /dev/null; then
        error "Certbot is not installed. Please install certbot and try again."
    fi
    
    # Generate certificate
    certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    # Copy certificates to SSL directory
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/$DOMAIN.crt"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/$DOMAIN.key"
    
    log "Let's Encrypt certificate generated successfully"
}

# Verify certificate
verify_certificate() {
    log "Verifying certificate..."
    
    # Check certificate details
    openssl x509 -in "$SSL_DIR/$DOMAIN.crt" -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:|DNS:|IP Address:)"
    
    # Verify certificate chain
    if [ -f "$SSL_DIR/ca.crt" ]; then
        openssl verify -CAfile "$SSL_DIR/ca.crt" "$SSL_DIR/$DOMAIN.crt"
    fi
    
    log "Certificate verification completed"
}

# Show certificate information
show_certificate_info() {
    echo
    info "Certificate Information:"
    info "Domain: $DOMAIN"
    info "Environment: $ENVIRONMENT"
    info "SSL Directory: $SSL_DIR"
    echo
    info "Generated files:"
    ls -la "$SSL_DIR"
    echo
    
    if [ "$ENVIRONMENT" = "development" ]; then
        warn "For development, you may need to add the CA certificate to your browser's trusted certificates."
        info "CA certificate location: $SSL_DIR/ca.crt"
    fi
    
    info "To use with Nginx, update your configuration with:"
    info "ssl_certificate $SSL_DIR/$DOMAIN.crt;"
    info "ssl_certificate_key $SSL_DIR/$DOMAIN.key;"
    
    if [ -f "$SSL_DIR/dhparam.pem" ]; then
        info "ssl_dhparam $SSL_DIR/dhparam.pem;"
    fi
}

# Main function
main() {
    log "Starting SSL certificate generation for MyGuide..."
    log "Domain: $DOMAIN"
    log "Environment: $ENVIRONMENT"
    
    check_openssl
    create_ssl_directory
    
    if [ "$ENVIRONMENT" = "production" ] && [ "$DOMAIN" != "localhost" ]; then
        # Production with Let's Encrypt
        read -p "Do you want to use Let's Encrypt for production certificates? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            generate_letsencrypt
        else
            generate_server_cert
        fi
    else
        # Development or localhost
        generate_ca_cert
        generate_server_cert
    fi
    
    generate_dhparam
    set_permissions
    verify_certificate
    show_certificate_info
    
    log "SSL certificate generation completed successfully! 🎉"
}

# Show usage
usage() {
    echo "Usage: $0 [domain] [environment]"
    echo "  domain      Domain name (default: localhost)"
    echo "  environment development|production (default: development)"
    echo
    echo "Examples:"
    echo "  $0                          # Generate for localhost (development)"
    echo "  $0 myguide.com production   # Generate for myguide.com (production)"
    echo "  $0 dev.myguide.com          # Generate for dev.myguide.com (development)"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    *)
        main
        ;;
esac
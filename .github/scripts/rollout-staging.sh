#!/bin/bash

###############################################################################
# Kubernetes Rollout Script for Staging Environment
#
# This script helps you manually rollout Kubernetes deployments after
# Docker images have been built and pushed by GitHub Actions.
#
# Usage:
#   ./rollout-staging.sh [service-name]
#   ./rollout-staging.sh all
#   ./rollout-staging.sh auction-management
#
# Services:
#   - auction-management
#   - websocket
#   - bid-processing
#   - timer
#   - all (rollout all services)
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-default}"
CLUSTER_NAME="${CLUSTER_NAME:-live-auction-staging-eks}"
REGION="${REGION:-us-east-1}"

# Service deployment names mapping
declare -A DEPLOYMENTS=(
    ["auction-management"]="auction-management"
    ["websocket"]="websocket"
    ["bid-processing"]="bid-processing"
    ["timer"]="timer"
)

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        echo "Please install kubectl: https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    print_success "kubectl is installed"
}

# Check if connected to the correct cluster
check_cluster() {
    print_info "Checking Kubernetes cluster connection..."

    CURRENT_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "none")

    if [ "$CURRENT_CONTEXT" = "none" ]; then
        print_error "No Kubernetes context selected"
        echo ""
        echo "Please configure kubectl to connect to your cluster:"
        echo "  aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME"
        exit 1
    fi

    print_success "Connected to context: $CURRENT_CONTEXT"

    # Verify cluster access
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    print_success "Cluster is accessible"
}

# Check if deployment exists
deployment_exists() {
    local deployment=$1
    kubectl get deployment "$deployment" -n "$NAMESPACE" &> /dev/null
}

# Rollout a single service
rollout_service() {
    local service=$1
    local deployment=${DEPLOYMENTS[$service]}

    if [ -z "$deployment" ]; then
        print_error "Unknown service: $service"
        return 1
    fi

    print_header "Rolling out: $service"

    # Check if deployment exists
    if ! deployment_exists "$deployment"; then
        print_error "Deployment '$deployment' not found in namespace '$NAMESPACE'"
        return 1
    fi

    # Get current image
    CURRENT_IMAGE=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
    print_info "Current image: $CURRENT_IMAGE"

    # Perform rollout restart
    print_info "Restarting deployment..."
    kubectl rollout restart deployment/"$deployment" -n "$NAMESPACE"

    # Wait for rollout to complete
    print_info "Waiting for rollout to complete..."
    if kubectl rollout status deployment/"$deployment" -n "$NAMESPACE" --timeout=5m; then
        print_success "Rollout completed successfully for $service"

        # Get new image
        NEW_IMAGE=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
        print_info "New image: $NEW_IMAGE"

        # Get pod status
        READY_REPLICAS=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
        DESIRED_REPLICAS=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
        print_success "Ready: $READY_REPLICAS/$DESIRED_REPLICAS replicas"
    else
        print_error "Rollout failed or timed out for $service"
        print_warning "Check pods status: kubectl get pods -n $NAMESPACE -l app=$service"
        print_warning "Check logs: kubectl logs -n $NAMESPACE -l app=$service --tail=50"
        return 1
    fi

    echo ""
}

# Rollout all services
rollout_all() {
    print_header "Rolling out all services"

    local failed=0

    for service in "${!DEPLOYMENTS[@]}"; do
        if ! rollout_service "$service"; then
            ((failed++))
        fi
    done

    echo ""
    print_header "Rollout Summary"

    if [ $failed -eq 0 ]; then
        print_success "All services rolled out successfully!"
    else
        print_warning "$failed service(s) failed to rollout"
        return 1
    fi
}

# Show deployment status
show_status() {
    print_header "Deployment Status"

    kubectl get deployments -n "$NAMESPACE" -o wide

    echo ""
    print_header "Pod Status"

    kubectl get pods -n "$NAMESPACE" -o wide
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [COMMAND]

Commands:
    auction-management    Rollout auction-management service
    websocket            Rollout websocket service
    bid-processing       Rollout bid-processing service
    timer                Rollout timer service
    all                  Rollout all services
    status               Show deployment status
    help                 Show this help message

Environment Variables:
    NAMESPACE            Kubernetes namespace (default: default)
    CLUSTER_NAME         EKS cluster name (default: live-auction-staging-eks)
    REGION               AWS region (default: us-east-1)

Examples:
    # Rollout single service
    $0 auction-management

    # Rollout all services
    $0 all

    # Check status
    $0 status

    # Use custom namespace
    NAMESPACE=staging $0 all

    # Connect to cluster first (if needed)
    aws eks update-kubeconfig --region us-east-1 --name live-auction-staging-eks
    $0 all

EOF
}

###############################################################################
# Main Script
###############################################################################

main() {
    # Parse command
    COMMAND=${1:-help}

    case "$COMMAND" in
        help|--help|-h)
            usage
            exit 0
            ;;
        status)
            check_kubectl
            check_cluster
            show_status
            exit 0
            ;;
        all)
            check_kubectl
            check_cluster
            rollout_all
            exit $?
            ;;
        auction-management|websocket|bid-processing|timer)
            check_kubectl
            check_cluster
            rollout_service "$COMMAND"
            exit $?
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

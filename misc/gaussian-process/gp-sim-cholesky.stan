// Sample from Gaussian Process
// Fixed covar function: eta_sq=1, rho_sq=1, sigma_sq=0.1

data {
  int<lower=1> N;
  real x[N];
}
transformed data {
  matrix[N,N] L;
  vector[N] mu;
  cov_matrix[N] Sigma;
  for (i in 1:N) 
    mu[i] <- 0;
  for (i in 1:N) 
    for (j in 1:N)
      Sigma[i,j] <- exp(-pow(x[i] - x[j],2)) + if_else(i==j, 0.1, 0.0);
  L <- cholesky_decompose(Sigma);
}
parameters {
  vector[N] z;
}
model {
  z ~ normal(0,1);
}
generated quantities {
  vector[N] y;
  y <- mu + L * z;
}

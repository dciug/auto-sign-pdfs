# The New-SelfSignedCertificate cmdlet allows to create a self-signed certificate
$cert = New-SelfSignedCertificate -DnsName MyTestCertificate -Type CodeSigning -CertStoreLocation Cert:\CurrentUser\My
#To verify that the certificate has been generated, run this command
Get-ChildItem -Path Cert:\CurrentUser\My | ? Subject -EQ "CN=MyTestCertificate"
# Export the certificate using the Export-PfxCertificate cmdlet
$CertPassword = ConvertTo-SecureString -String "password" -Force –AsPlainText
Export-PfxCertificate -Cert "cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath "./MY_TEST_CERTIFICATE.pfx" -Password $CertPassword
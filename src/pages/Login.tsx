import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { Card, Button, Input, FormGroup, Label, ErrorMessage } from '../styles/GlobalStyles';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  margin: 20px;
`;

const LoginTitle = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoginButton = styled(Button)`
  width: 100%;
  padding: 14px;
  font-size: 16px;
`;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorData = err.response?.data?.error;
      let errorMessage = errorData?.message || 
                        err.message || 
                        'Login failed. Please check your credentials.';
      
      // Handle rate limit errors with retry information
      if (errorData?.code === 'RATE_LIMIT_EXCEEDED') {
        if (errorData?.retryAfter) {
          const retrySeconds = Math.ceil(errorData.retryAfter);
          const retryMinutes = Math.ceil(retrySeconds / 60);
          if (retryMinutes > 1) {
            errorMessage += ` You can try again in ${retryMinutes} minutes.`;
          } else {
            errorMessage += ` You can try again in ${retrySeconds} seconds.`;
          }
        }
      }
      
      setError(errorMessage);
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle>Invoice Manager {t('login')}</LoginTitle>
        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">{t('username')}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={loading}>
            {loading ? t('loading') : t('loginButton')}
          </LoginButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;


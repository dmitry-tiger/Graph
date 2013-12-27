package Graph::Auth;
use Mojolicious::Plugin::Authentication;
use Authen::Simple::LDAP;
use Mojo::Base 'Mojolicious::Controller';

sub login{
    my $self=shift;
    $self->plugin('authentication' => {
        'autoload_user' => 1,
        'session_key' => 'wickedapp',
        'load_user' => \&load_user,
        'validate_user' => \&validate_user,
        'current_user_fn' => 'user', # compatibility with old code
    });
}

sub validate_user{
    
}

sub load_user{
    
}
1;
package Graph;
use Mojo::Base 'Mojolicious';
#use Mojolicious::Plugin::Config;
#use Mojolicious::Plugin::Database;
use DBIx::Connector;
# This method will run once at server start

has dbc => sub {
  my $self = shift;
  my $connector = DBIx::Connector->new(
    "dbi:mysql:database=".$self->{config}->{db}->{name}.';host='.$self->{config}->{db}->{host}.';port='.$self->{config}->{db}->{port},
    $self->{config}->{db}->{user},
    $self->{config}->{db}->{pass},
    { AutoCommit => 1, }
  );
  $connector->mode('ping');
  return $connector;
};


sub startup {
  my $self = shift;
  $self->setup_routing;
  $self->plugin('PODRenderer');
  my $config = $self->plugin('Config');
  $self->secret($self->{config}->{general}->{cookie_secret});
#  $self->mode('production');

  $self->helper('dbc' => sub { return shift->app->dbc });
  
  $self->plugin('authentication' => {
        'autoload_user' => 1,
        'session_key' => 'wickedapp',
        'load_user' => sub { [pop] },
        'validate_user' => sub{
          my ($app, $username, $password,$ldap) = @_;
          if ( $ldap->authenticate( $username, $password ) ) {
              return $username;
          }
          else { 
            return undef;
          }
        },
        'current_user_fn' => 'user', # compatibility with old code
    });
 
  
}

sub setup_routing {
    my $self = shift;
    my $r = $self->routes;
      $r->get('/')->to('screen#newscreen');
      $r->get('/:id/dash/:refresh/')->to('screen#dash');
      $r->get('/:id/dash/')->to('screen#dash');
      $r->get('/do/ajax_get_all_hosts')->to('screen#ajax_get_all_hosts');
      $r->get('/do/ajax_get_items')->to('screen#ajax_get_items');
      $r->get('/do/ajax_get_items_by_itemids')->to('screen#ajax_get_items_by_itemids');
      $r->post('/do/fork')->to('screen#fork');
      $r->post('/do/save')->to('screen#save');
      $r->post('/do/delete')->to('screen#delete');
      $r->get('/zlogin/:server/')->to('screen#login');
      $r->post('/do/login')->to('auth#login');
      $r->get('/do/islogined')->to('auth#islogined');
      $r->get('/do/logout')->to('auth#dologout');
      $r->get('/do/fetchprojects')->to('auth#fetchprojects');
#      $r->get('/:id/:type/', type => [qw(view dash)])->to( controller => 'screen', view => 'fetch');
      $r->get('/:id/view/')->to('screen#view');
      $r->get('/:id/fetch/')->to('screen#fetch');
      $r->get('/analyzer/')->to('eanalyzer#new_ea');
#      $r->get('/:id/:type/', type => [qw(view dash)])->to( controller => 'screen', view => 'type');
}

1;

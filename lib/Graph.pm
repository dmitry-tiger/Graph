package Graph;
use Mojo::Base 'Mojolicious';
#use Mojolicious::Plugin::Config;
use Mojolicious::Plugin::Database;

# This method will run once at server start
sub startup {
  my $self = shift;
  $self->setup_routing;
  # Documentation browser under "/perldoc"
  $self->plugin('PODRenderer');
  my $config = $self->plugin('Config');
  $self->plugin('database', { 
    dsn      => 'dbi:mysql:dbname='.$self->{config}->{db}->{name}.';host='.$self->{config}->{db}->{host}.';port='.$self->{config}->{db}->{port},
    username => $self->{config}->{db}->{user},
    password => $self->{config}->{db}->{pass},
    options  => { 'pg_enable_utf8' => 1, AutoCommit => 1 },
    helper   => 'db',
    }); 
  # Router
#  say $config->{zabbix}->{servers};

  # Normal route to controller
}

sub setup_routing {
    my $self = shift;
    my $r = $self->routes;
      $r->get('/')->to('screen#newscreen');
      $r->get('/dash/')->to('screen#dash');
      $r->get('/do/ajax_get_all_hosts')->to('screen#ajax_get_all_hosts');
      $r->get('/do/ajax_get_items')->to('screen#ajax_get_items');
      $r->get('/do/ajax_get_items_by_itemids')->to('screen#ajax_get_items_by_itemids');
      $r->post('/do/fork')->to('screen#fork');
      $r->post('/do/save')->to('screen#save');
      $r->get('/zlogin/:server/')->to('screen#login');
#      $r->get('/:id/:type/', type => [qw(view dash)])->to( controller => 'screen', view => 'fetch');
      $r->get('/:id/view/')->to('screen#view');
      $r->get('/:id/fetch/')->to('screen#fetch');
#      $r->get('/:id/:type/', type => [qw(view dash)])->to( controller => 'screen', view => 'type');
}

1;

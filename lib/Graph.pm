package Graph;
use Mojo::Base 'Mojolicious';

# This method will run once at server start
sub startup {
  my $self = shift;
  $self->setup_routing;
  # Documentation browser under "/perldoc"
  $self->plugin('PODRenderer');

  # Router


  # Normal route to controller
}

sub setup_routing {
    my $self = shift;
    my $r = $self->routes;
      $r->get('/')->to('screen#new');
      $r->get('/dash/')->to('screen#dash');
      $r->get('/:id/:type', name => [qw(view dash)])->to('screen#view');
}

1;

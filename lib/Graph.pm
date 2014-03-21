package Graph;
use Mojo::Base 'Mojolicious';
use Zabapi;
use DBIx::Connector;

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
  $self->mode('production');
  $self->helper('dbc' => sub { return shift->app->dbc });
  $self->helper('zapilogin' => sub {
      my $self = shift;
      my $zserver = shift || "";
      my $zserverUrl = "http://".$zserver.$self->stash->{config}->{zabbix}->{domain}."/api_jsonrpc.php";
      my $zabapi = Zabapi->new(server => $zserverUrl, verbosity => '0');
      say $zserverUrl;
      my $zabbixAuth = { user => $self->stash->{config}->{zabbix}->{username}, password => $self->stash->{config}->{zabbix}->{password}};
      eval {
      my $res =$zabapi->login($zabbixAuth);
      };
      if ($@) {
    #    $self->render(json => {"error"=>"$@" });
        return $@->message;
      }
      else
      {
        if (defined $zabapi->{cookie}) {
          return $zabapi;
        }
        else {
          return '-1';
        }
      } 
  });
  
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
      $r->get('/zlogin/#server/')->to('screen#login');
      $r->post('/do/login')->to('auth#login');
      $r->get('/do/islogined')->to('auth#islogined');
      $r->get('/do/logout')->to('auth#dologout');
      $r->get('/do/fetchprojects')->to('screen#fetchprojects');
      $r->get('/do/fetchbookmarks')->to('screen#fetchbookmarks');
      $r->get('/:id/view/')->to('screen#view');
      $r->get('/:id/fetch/')->to('screen#fetch');
      $r->get('/analyzer/')->to('eanalyzer#new_ea');
      $r->get('/do/bookmark/:id')->to('screen#bookmark');
      $r->get('/do/checkbookmarked/:id')->to('screen#checkbookmarked');
      $r->get('/do/deletebookmark/:id')->to('screen#deletebookmark');
      $r->post('/do/getevents/')->to('eanalyzer#getevents');
      $r->post('/do/gengraphfromevents/')->to('eanalyzer#gengraph');

}

1;
